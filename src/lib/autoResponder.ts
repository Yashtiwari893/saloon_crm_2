import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { Groq } from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { embedText } from "@/lib/embeddings";
import { retrieveRelevantChunksForPhoneNumber } from "@/lib/retrieval";

import {
  checkSlotAvailability,
  createSalonBooking,
  cancelSalonBooking,
  getCustomerLatestBooking,
} from "@/lib/salonBookingEngine";

export interface AutoResponseResult {
  success: boolean;
  duplicate?: boolean;
  response: string;
  sent?: boolean;
  error?: string;
  noDocuments?: boolean;
}

export async function sendWhatsAppMessage(
  toPhone: string,
  text: string,
  authToken: string,
  origin: string
): Promise<boolean> {
  try {
    const url = `${origin.replace(/\/$/, "")}/api/v1/send-message`;
    const payload = {
      to: toPhone,
      type: "text",
      text: { body: text },
    };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error(`11za send API failed (${res.status}):`, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("Failed to send WhatsApp message via 11za:", err);
    return false;
  }
}

async function hasExistingAutoResponse(messageId: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from("whatsapp_messages")
    .select("id, auto_respond_sent")
    .eq("message_id", messageId)
    .maybeSingle();

  return data?.auto_respond_sent ?? false;
}

export async function handleSalonAutoResponse(
  messageId: string,
  fromNumber: string,
  toNumber: string,
  messageText: string,
  senderName?: string
): Promise<AutoResponseResult> {
  try {
    console.log(`--- Starting Salon Auto-Response for ${fromNumber} -> ${toNumber} ---`);
    const startTime = Date.now();

    if (await hasExistingAutoResponse(messageId)) {
      await supabaseAdmin
        .from("whatsapp_messages")
        .update({
          auto_respond_sent: true,
          response_sent_at: new Date().toISOString(),
        })
        .eq("message_id", messageId);

      return {
        success: true,
        duplicate: true,
        sent: false,
        response: "",
      };
    }

    // 1. Fetch mapping credentials for 11za WhatsApp API
    const mappingResult = await supabaseAdmin
      .from("phone_document_mapping")
      .select("system_prompt, auth_token, origin, gemini_api_key, groq_api_key, mistral_api_key")
      .eq("phone_number", toNumber)
      .maybeSingle();

    const phoneMapping = mappingResult.data || {
      auth_token: process.env.WHATSAPP_AUTH_TOKEN || "demo-token",
      origin: process.env.WHATSAPP_ORIGIN || "demo-origin",
      system_prompt: "",
      gemini_api_key: process.env.GEMINI_API_KEY || "",
      groq_api_key: process.env.GROQ_API_KEY || "",
      mistral_api_key: process.env.MISTRAL_API_KEY || "",
    };

    const auth_token = phoneMapping.auth_token;
    const origin = phoneMapping.origin;

    const cleanMsg = messageText.trim().toLowerCase();

    // QUICK HANDLER 1: Interactive Main Menu Trigger ("Hi", "Hello", "Menu", "Hey")
    if (cleanMsg === "hi" || cleanMsg === "hello" || cleanMsg === "hey" || cleanMsg === "menu") {
      const menuText = 
`Welcome to XYZ Salon ✨

Please choose an option:
1️⃣ Book Appointment
2️⃣ View Services
3️⃣ Today's Offers
4️⃣ Talk to Support
5️⃣ My Booking

Reply with a number or tell us what you'd like to do!`;

      if (auth_token && origin) {
        await sendWhatsAppMessage(fromNumber, menuText, auth_token, origin);
      }
      return { success: true, response: menuText, sent: true };
    }

    // QUICK HANDLER 2: "My Booking" or "5"
    if (cleanMsg === "5" || cleanMsg.includes("my booking") || cleanMsg.includes("meri booking")) {
      const booking = await getCustomerLatestBooking(fromNumber);
      let replyText = "";
      if (!booking) {
        replyText = "Aapki koi active booking nahi mili! 1️⃣ Type karke new appointment book karein.";
      } else {
        replyText = 
`Your Active Booking 📅

Booking ID: ${booking.booking_code}
Barber: ${booking.barbers?.name || 'Rahul'}
Date: ${booking.booking_date}
Time: ${booking.start_time}
Status: ${booking.status.toUpperCase()}
Total: ₹${booking.total_price}

To cancel, reply 'Cancel Booking'.`;
      }
      if (auth_token && origin) {
        await sendWhatsAppMessage(fromNumber, replyText, auth_token, origin);
      }
      return { success: true, response: replyText, sent: true };
    }

    // QUICK HANDLER 3: Cancel Booking
    if (cleanMsg.includes("cancel") || cleanMsg === "cancel booking") {
      const cancelRes = await cancelSalonBooking(fromNumber);
      let replyText = "";
      if (cancelRes.success) {
        replyText = "Aapki booking successfully cancel ho gayi hai ✅ Slot free kar diya gaya hai. Phir se book karne ke liye 'Hi' bhejein!";
      } else {
        replyText = cancelRes.error || "Aapki active booking nahi mili cancel karne ke liye.";
      }
      if (auth_token && origin) {
        await sendWhatsAppMessage(fromNumber, replyText, auth_token, origin);
      }
      return { success: true, response: replyText, sent: true };
    }

    // 2. Fetch history & stage for LLM processing
    const [queryEmbedding, historyResult, userStageData] = await Promise.all([
      embedText(messageText, 3, phoneMapping.mistral_api_key),
      supabaseAdmin
        .from("whatsapp_messages")
        .select("content_text, event_type, from_number, to_number")
        .or(`and(from_number.eq.${fromNumber},to_number.eq.${toNumber}),and(from_number.eq.${toNumber},to_number.eq.${fromNumber})`)
        .order("created_at", { ascending: true })
        .limit(10),
      getUserConversationStage(fromNumber, toNumber)
    ]);

    let contextText = "";
    if (queryEmbedding) {
      const matches = await retrieveRelevantChunksForPhoneNumber(queryEmbedding, toNumber, 3);
      if (matches && matches.length > 0) {
        contextText = matches.map((m: any) => m.chunk).join("\n---\n");
      }
    }

    const conversationHistory = (historyResult.data || []).map((m: any) => ({
      role: m.from_number === fromNumber ? ("user" as const) : ("assistant" as const),
      content: m.content_text || "",
    }));

    const systemPrompt = phoneMapping.system_prompt || `You are an AI Salon Assistant for Velvety Salon. Help customers book haircut, facial, beard spa appointments. Be polite, concise, and professional.`;

    const fullSystemPrompt = `${systemPrompt}\n\nContext Information:\n${contextText}\n\nCurrent User Stage: ${userStageData?.current_stage || "DISCOVERY"}`;

    const messages = [
      { role: "system" as const, content: fullSystemPrompt },
      ...conversationHistory,
      { role: "user" as const, content: messageText }
    ];

    // Model Execution Priority: PRIMARY = GOOGLE GEMINI 1.5 FLASH (Fallback = Groq LLaMA)
    let response = "";
    const geminiKey = phoneMapping.gemini_api_key || process.env.GEMINI_API_KEY;
    const groqKey = phoneMapping.groq_api_key || process.env.GROQ_API_KEY;

    async function tryGemini() {
      if (!geminiKey) throw new Error("Gemini API key not configured");
      const localGenAI = new GoogleGenerativeAI(geminiKey);
      const model = localGenAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent({
        contents: messages.map(m => ({
          role: m.role === "system" ? "user" : (m.role === "user" ? "user" : "model"),
          parts: [{ text: m.content }]
        })).slice(1),
        systemInstruction: messages[0].content,
      });
      return result.response.text();
    }

    async function tryGroq(model: string) {
      if (!groqKey) throw new Error("Groq API key not configured");
      const localGroq = new Groq({ apiKey: groqKey });
      const completion = await localGroq.chat.completions.create({
        model: model,
        messages,
        temperature: 0.2,
        max_tokens: 250,
      });
      return completion.choices[0].message.content || "";
    }

    try {
      console.log("Generating response using Google Gemini 1.5 Flash...");
      response = await tryGemini();
    } catch (errGemini) {
      console.warn("Gemini API failed, falling back to Groq LLaMA 3.3:", errGemini);
      try {
        response = await tryGroq("llama-3.3-70b-versatile");
      } catch (errGroq) {
        try {
          response = await tryGroq("llama3-8b-8192");
        } catch (err3) {
          console.error("All LLM models failed:", err3);
          response = "Namaste! Aapke message ke liye dhanyawad. Hamare salon representative jaldi aapko reply karenge.";
        }
      }
    }

    if (auth_token && origin && response) {
      await sendWhatsAppMessage(fromNumber, response, auth_token, origin);
    }

    await supabaseAdmin
      .from("whatsapp_messages")
      .update({
        auto_respond_sent: true,
        response_sent_at: new Date().toISOString(),
      })
      .eq("message_id", messageId);

    console.log(`Auto-response generated in ${Date.now() - startTime}ms`);
    return { success: true, response, sent: true };
  } catch (err: any) {
    console.error("Error in handleSalonAutoResponse:", err);
    return { success: false, error: err.message || "Failed auto response", response: "" };
  }
}

// Alias export for backward compatibility with routes
export { handleSalonAutoResponse as generateAutoResponse };

async function getUserConversationStage(fromNumber: string, toNumber: string) {
  try {
    const { data } = await supabaseAdmin
      .from("user_conversation_data")
      .select("*")
      .eq("from_number", fromNumber)
      .eq("to_number", toNumber)
      .maybeSingle();

    return data;
  } catch (err) {
    return null;
  }
}