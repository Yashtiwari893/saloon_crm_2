import { supabaseAdmin } from "./supabaseAdmin";
import { embedText } from "./embeddings";
import { retrieveRelevantChunksForPhoneNumber } from "./retrieval";
import { getFilesForPhoneNumber } from "./phoneMapping";
import { sendWhatsAppMessage } from "./whatsappSender";
import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { MASTER_SYSTEM_PROMPT, getUserConversationStage, updateUserConversationStage } from "./persona";
import { cancelSalonBooking, getCustomerLatestBooking } from "./salonBookingEngine";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY!,
});

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

export type AutoResponseResult = {
    success: boolean;
    response?: string;
    error?: string;
    noDocuments?: boolean;
    sent?: boolean;
    duplicate?: boolean;
};

async function hasExistingAutoResponse(sourceMessageId: string) {
    const { data, error } = await supabaseAdmin
        .from("whatsapp_messages")
        .select("message_id")
        .eq("event_type", "MtMessage")
        .contains("raw_payload", { source_message_id: sourceMessageId })
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error("AUTO_RESPONDER_DUPLICATE_LOOKUP_ERROR:", error);
    }

    return Boolean(data);
}

/**
 * Generate an automatic response for a WhatsApp message
 */
export async function generateAutoResponse(
    fromNumber: string,
    toNumber: string,
    messageText: string,
    messageId: string,
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
                .order("received_at", { ascending: true })
                .limit(10),
            getUserConversationStage(fromNumber, toNumber)
        ]);

        let contextText = "";
        if (queryEmbedding) {
            const matches = await retrieveRelevantChunksForPhoneNumber(queryEmbedding, toNumber, 3);
            if (matches && matches.length > 0) {
                contextText = matches.map((m) => m.chunk).join("\n\n");
            }
        }

        const historyRows = historyResult.data || [];
        const history = historyRows
            .filter(m => m.content_text && (m.event_type === "MoMessage" || m.event_type === "MtMessage"))
            .map(m => ({
                role: m.event_type === "MoMessage" ? "user" as const : "assistant" as const,
                content: m.content_text
            }));

        const detectedLanguage = detectLanguage(messageText, history);

        // Build Master System Prompt
        let systemPrompt: string = MASTER_SYSTEM_PROMPT;
        systemPrompt += `\n\n=== CURRENT CONVERSATION STATE ===\n`;
        systemPrompt += `- Current Stage: ${userStageData.current_stage}\n`;
        systemPrompt += `- Collected Info: ${JSON.stringify(userStageData.collected_info)}\n`;
        systemPrompt += `- Detected Language: ${detectedLanguage}\n`;

        if (phoneMapping.system_prompt) {
            systemPrompt += `\n\n=== CUSTOM SALON RULES ===\n${phoneMapping.system_prompt}\n`;
        }

        if (contextText) {
            systemPrompt += `\n\n=== SALON KNOWLEDGE BASE (PRICING & SERVICES) ===\n${contextText}\n`;
        }

        const visitorContext = senderName ? `\n\n- Customer Name: ${senderName}` : "";
        const messages = [
            { role: "system" as const, content: `${systemPrompt}${visitorContext}` },
            ...history.slice(-6),
            { role: "user" as const, content: messageText }
        ];

        // Model Fallback Priority (Groq 70B -> Gemini -> Groq 8B)
        let response = "";
        const geminiKey = phoneMapping.gemini_api_key || process.env.GEMINI_API_KEY;
        const groqKey = phoneMapping.groq_api_key || process.env.GROQ_API_KEY;

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

        try {
            response = await tryGroq("llama-3.3-70b-versatile");
        } catch (err1) {
            try {
                response = await tryGemini();
            } catch (err2) {
                try {
                    response = await tryGroq("llama-3.1-8b-instant");
                } catch (err3) {
                    response = "Thank you for contacting XYZ Salon! How can we assist you today?";
                }
            }
        }

        // Clean meta-tags
        response = response
            .replace(/\[STAGE:\s*.*?\]/gi, "")
            .replace(/\[INFO:\s*.*?=.*?\]/gi, "")
            .trim();

        // Send Outbound WhatsApp Message
        if (auth_token && origin) {
            await sendWhatsAppMessage(fromNumber, response, auth_token, origin);
        }

        // Store outbound record in Database
        const responseMessageId = `auto_${messageId}_${Date.now()}`;
        await supabaseAdmin.from("whatsapp_messages").insert([{
            message_id: responseMessageId,
            channel: "whatsapp",
            from_number: toNumber,
            to_number: fromNumber,
            received_at: new Date().toISOString(),
            content_type: "text",
            content_text: response,
            sender_name: "Salon Assistant",
            event_type: "MtMessage",
            is_in_24_window: true,
            raw_payload: { source_message_id: messageId },
        }]);

        await supabaseAdmin.from("whatsapp_messages").update({
            auto_respond_sent: true,
            response_sent_at: new Date().toISOString(),
        }).eq("message_id", messageId);

        return { success: true, response, sent: true };
    } catch (error) {
        console.error("Salon Auto-response error:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

function detectLanguage(text: string, history: Array<{role: string, content: string}>): string {
    const lowerText = text.toLowerCase();
    const hindiChars = /[अ-ह्]/;
    const gujaratiChars = /[અ-હ્]/;
    if (hindiChars.test(text)) return "hindi";
    if (gujaratiChars.test(text)) return "gujarati";
    if (/\b(haircut|booking|barber|appointment|price|time|today)\b/.test(lowerText)) return "english";
    return "hinglish";
}