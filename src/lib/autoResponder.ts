import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { Groq } from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { embedText } from "@/lib/embeddings";
import { retrieveRelevantChunksForPhoneNumber } from "@/lib/retrieval";
import { sendWhatsAppMessage } from "@/lib/whatsappSender";
import { logHeader, logStep, logAiGeneration, logError } from "@/lib/logger";

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

export { sendWhatsAppMessage };

async function hasExistingAutoResponse(messageId: string): Promise<boolean> {
  try {
    const { data } = await supabaseAdmin
      .from("whatsapp_messages")
      .select("id, auto_respond_sent")
      .eq("message_id", messageId)
      .maybeSingle();

    return data?.auto_respond_sent ?? false;
  } catch (e) {
    return false;
  }
}

export async function handleSalonAutoResponse(
  messageId: string,
  fromNumber: string,
  toNumber: string,
  messageText: string,
  senderName?: string
): Promise<AutoResponseResult> {
  const startTime = Date.now();
  try {
    logHeader(`SALON AI AUTO-RESPONDER EXECUTING`);
    logStep("AUTO_RESPONDER_INPUT", { messageId, fromNumber, toNumber, messageText, senderName });

    if (await hasExistingAutoResponse(messageId)) {
      logStep("DUPLICATE_CHECK", `MessageId ${messageId} already responded. Skipping.`);
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
      origin: process.env.WHATSAPP_ORIGIN || "https://api.11za.in",
      system_prompt: "",
      gemini_api_key: process.env.GEMINI_API_KEY || "",
      groq_api_key: process.env.GROQ_API_KEY || "",
      mistral_api_key: process.env.MISTRAL_API_KEY || "",
    };

    const authToken = phoneMapping.auth_token || process.env.WHATSAPP_AUTH_TOKEN || "";
    const originWebsite = phoneMapping.origin || process.env.WHATSAPP_ORIGIN || "https://api.11za.in";

    logStep("11ZA_CREDENTIALS_RESOLVED", {
      hasAuthToken: Boolean(authToken),
      originWebsite,
      hasGeminiKey: Boolean(phoneMapping.gemini_api_key || process.env.GEMINI_API_KEY),
    });

    const cleanMsg = messageText.trim().toLowerCase();

    // QUICK HANDLER 0: Interactive Main Menu Trigger ("Hi", "Hello", "Menu", "Hey")
    if (cleanMsg === "hi" || cleanMsg === "hello" || cleanMsg === "hey" || cleanMsg === "menu") {
      const menuText = 
`Welcome to Velvety Salon ✨

Please choose an option:
1️⃣ Book Appointment
2️⃣ View Services
3️⃣ Today's Offers
4️⃣ Talk to Support
5️⃣ My Booking

Reply with a number or tell us what you'd like to do!`;

      logStep("MENU_TRIGGER_RESPONSE", menuText);
      let sentStatus = false;
      if (authToken && originWebsite) {
        const sendRes = await sendWhatsAppMessage(fromNumber, menuText, authToken, originWebsite);
        sentStatus = sendRes.success;
      }
      return { success: true, response: menuText, sent: sentStatus };
    }

    // QUICK HANDLER 1: "1" or "Book Appointment"
    if (cleanMsg === "1" || cleanMsg === "book appointment" || cleanMsg.includes("book appointment")) {
      const replyText = `To book an appointment, please reply with your preferred Barber & Date/Time (e.g. 'Rahul, Tomorrow 4 PM') or service name (e.g. 'Haircut & Beard Trim')! ✂️`;
      logStep("OPTION_1_TRIGGER_RESPONSE", replyText);
      let sentStatus = false;
      if (authToken && originWebsite) {
        const sendRes = await sendWhatsAppMessage(fromNumber, replyText, authToken, originWebsite);
        sentStatus = sendRes.success;
      }
      return { success: true, response: replyText, sent: sentStatus };
    }

    // QUICK HANDLER 2: "2" or "View Services"
    if (cleanMsg === "2" || cleanMsg === "view services" || cleanMsg.includes("view services")) {
      const replyText = 
`✂️ Velvety Salon Services Catalog:

1. Haircut & Styling - ₹250
2. Beard Trim & Styling - ₹150
3. Royal Haircut + Beard Combo - ₹350
4. Charcoal Deep Cleansing Facial - ₹499
5. Head & Shoulder Spa Massage - ₹599

Reply with service name or '1' to book!`;
      logStep("OPTION_2_TRIGGER_RESPONSE", replyText);
      let sentStatus = false;
      if (authToken && originWebsite) {
        const sendRes = await sendWhatsAppMessage(fromNumber, replyText, authToken, originWebsite);
        sentStatus = sendRes.success;
      }
      return { success: true, response: replyText, sent: sentStatus };
    }

    // QUICK HANDLER 3: "3" or "Offers"
    if (cleanMsg === "3" || cleanMsg.includes("offer") || cleanMsg.includes("discount")) {
      const replyText = 
`🎉 Today's Special Offers:

🌟 Combo Offer: Haircut + Beard Trim for ₹350 (Save ₹50!)
🌟 Mid-Week Glow: Facial + Head Massage @ ₹699

Reply '1' to book your slot now!`;
      logStep("OPTION_3_TRIGGER_RESPONSE", replyText);
      let sentStatus = false;
      if (authToken && originWebsite) {
        const sendRes = await sendWhatsAppMessage(fromNumber, replyText, authToken, originWebsite);
        sentStatus = sendRes.success;
      }
      return { success: true, response: replyText, sent: sentStatus };
    }

    // QUICK HANDLER 4: "4" or "Support"
    if (cleanMsg === "4" || cleanMsg.includes("support") || cleanMsg.includes("talk to support")) {
      const replyText = `📞 Salon Manager Support:\nOur salon representative is available at +91 9005300803. You can call directly or type your query here!`;
      logStep("OPTION_4_TRIGGER_RESPONSE", replyText);
      let sentStatus = false;
      if (authToken && originWebsite) {
        const sendRes = await sendWhatsAppMessage(fromNumber, replyText, authToken, originWebsite);
        sentStatus = sendRes.success;
      }
      return { success: true, response: replyText, sent: sentStatus };
    }

    // QUICK HANDLER 5: "My Booking" or "5"
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
      logStep("MY_BOOKING_TRIGGER_RESPONSE", replyText);
      let sentStatus = false;
      if (authToken && originWebsite) {
        const sendRes = await sendWhatsAppMessage(fromNumber, replyText, authToken, originWebsite);
        sentStatus = sendRes.success;
      }
      return { success: true, response: replyText, sent: sentStatus };
    }

    // QUICK HANDLER 6: Cancel Booking
    if (cleanMsg.includes("cancel") || cleanMsg === "cancel booking") {
      const cancelRes = await cancelSalonBooking(fromNumber);
      let replyText = "";
      if (cancelRes.success) {
        replyText = "Aapki booking successfully cancel ho gayi hai ✅ Slot free kar diya gaya hai. Phir se book karne ke liye 'Hi' bhejein!";
      } else {
        replyText = cancelRes.error || "Aapki active booking nahi mili cancel karne ke liye.";
      }
      logStep("CANCEL_BOOKING_TRIGGER_RESPONSE", replyText);
      let sentStatus = false;
      if (authToken && originWebsite) {
        const sendRes = await sendWhatsAppMessage(fromNumber, replyText, authToken, originWebsite);
        sentStatus = sendRes.success;
      }
      return { success: true, response: replyText, sent: sentStatus };
    }

    // 2. Safely Fetch history, stage & RAG embeddings without throwing
    logStep("FETCHING_CONTEXT_AND_HISTORY");
    let queryEmbedding: number[] | null = null;
    try {
      queryEmbedding = await embedText(messageText, 1, phoneMapping.mistral_api_key);
    } catch (embedErr) {
      logError("Mistral Embeddings Non-Fatal Error", embedErr);
    }

    const [historyResult, userStageData] = await Promise.all([
      supabaseAdmin
        .from("whatsapp_messages")
        .select("content_text, event_type, from_number, to_number")
        .or(`and(from_number.eq.${fromNumber},to_number.eq.${toNumber}),and(from_number.eq.${toNumber},to_number.eq.${fromNumber})`)
        .order("created_at", { ascending: true })
        .limit(10),
      getUserConversationStage(fromNumber, toNumber)
    ]);

    let contextText = "";
    if (queryEmbedding && Array.isArray(queryEmbedding) && queryEmbedding.length > 0) {
      try {
        const matches = await retrieveRelevantChunksForPhoneNumber(queryEmbedding, toNumber, 3);
        if (matches && matches.length > 0) {
          contextText = matches.map((m: any) => m.chunk).join("\n---\n");
        }
      } catch (ragErr) {
        logError("RAG Retrieval Non-Fatal Error", ragErr);
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

    // Model Execution Priority: PRIMARY = GOOGLE GEMINI (Fallback = Groq LLaMA)
    let response = "";
    const geminiKey = phoneMapping.gemini_api_key || process.env.GEMINI_API_KEY;
    const groqKey = phoneMapping.groq_api_key || process.env.GROQ_API_KEY;

    async function tryGeminiModel(modelName: string) {
      if (!geminiKey) throw new Error("Gemini API key not configured");
      const localGenAI = new GoogleGenerativeAI(geminiKey);
      const model = localGenAI.getGenerativeModel({ model: modelName });
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

    const aiStartTime = Date.now();
    try {
      logStep("TRYING_GEMINI_AI");
      try {
        response = await tryGeminiModel("gemini-1.5-flash-latest");
      } catch (e1) {
        response = await tryGeminiModel("gemini-1.5-pro");
      }
      logAiGeneration("gemini-ai", fullSystemPrompt, response, Date.now() - aiStartTime);
    } catch (errGemini) {
      logError("Gemini AI Exception", errGemini);
      try {
        logStep("FALLBACK_TO_GROQ_70B");
        response = await tryGroq("llama-3.3-70b-versatile");
        logAiGeneration("llama-3.3-70b-versatile", fullSystemPrompt, response, Date.now() - aiStartTime);
      } catch (errGroq) {
        logError("Groq 70B Exception", errGroq);
        try {
          response = await tryGroq("llama3-8b-8192");
        } catch (err3) {
          logError("All AI Models Failed", err3);
          response = "Namaste! Aapke message ke liye dhanyawad. Hamare salon representative jaldi aapko reply karenge.";
        }
      }
    }

    let sendStatus = false;
    if (authToken && originWebsite && response) {
      logStep("SENDING_WHATSAPP_REPLY_VIA_11ZA", { to: fromNumber, responseLength: response.length });
      const sendRes = await sendWhatsAppMessage(fromNumber, response, authToken, originWebsite);
      sendStatus = sendRes.success;
    } else {
      logError("WhatsApp Send Skipped", { authTokenPresent: Boolean(authToken), originWebsite, responsePresent: Boolean(response) });
    }

    await supabaseAdmin
      .from("whatsapp_messages")
      .update({
        auto_respond_sent: true,
        response_sent_at: new Date().toISOString(),
      })
      .eq("message_id", messageId);

    logStep("AUTO_RESPONDER_SUCCESS", { totalDurationMs: Date.now() - startTime, sent: sendStatus });
    return { success: true, response, sent: sendStatus };
  } catch (err: any) {
    logError("handleSalonAutoResponse Fatal Error", err);
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