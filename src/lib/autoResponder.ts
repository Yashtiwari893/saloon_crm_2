import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendWhatsAppMessage } from "@/lib/whatsappSender";
import { logHeader, logStep, logError } from "@/lib/logger";
import { resolveSalonContextForIncomingMessage, upsertWhatsAppSession } from "@/lib/salonResolver";
import { getWhatsAppSession, updateWhatsAppSessionStep } from "@/lib/whatsappStateMachine";
import { loadConversationMemory, saveConversationMemory } from "@/lib/conversationMemory";
import { parseUserMessageNlu } from "@/lib/nluEngine";
import { processStateMachineStep } from "@/lib/conversationStateMachine";

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
    logHeader(`OPTION D HYBRID SALON AUTO-RESPONDER EXECUTING`);
    logStep("AUTO_RESPONDER_INPUT", { messageId, fromNumber, toNumber, messageText, senderName });

    if (await hasExistingAutoResponse(messageId)) {
      logStep("DUPLICATE_CHECK", `MessageId ${messageId} already responded. Skipping.`);
      return { success: true, duplicate: true, sent: false, response: "" };
    }

    // 1. Execute Option D 4-Layer Salon Resolution Engine
    const resolution = await resolveSalonContextForIncomingMessage(fromNumber, messageText);
    logStep("SALON_RESOLUTION_RESULT", resolution);

    let activeSalonId = resolution.salonId;
    let replyText = "";

    // Handle Fallback Options if Salon Context is not yet resolved
    if (!activeSalonId && (resolution.resolutionType === "MULTI_MATCH_FALLBACK" || resolution.resolutionType === "NO_MATCH_FALLBACK")) {
      const salons = resolution.matchedSalons || [];
      if (salons.length > 0) {
        const salonListStr = salons.map((s, idx) => `${idx + 1}️⃣ *${s.name}* (Ref: ${s.slug})`).join("\n");
        replyText = `Welcome to Inwante Salon Network 👋\n\nPlease select your salon by replying with its number or slug:\n\n${salonListStr}`;
      } else {
        replyText = `Welcome to Inwante Salon Network 👋\n\nPlease scan your salon's QR code or ask reception for their WhatsApp booking link!`;
      }
    } else {
      // 2. Fetch Phone Mapping Credentials & Tenant Config for activeSalonId
      let phoneMapping: any = null;
      if (activeSalonId) {
        const mappingRes = await supabaseAdmin
          .from("phone_document_mapping")
          .select("salon_id, system_prompt, auth_token, origin, gemini_api_key")
          .eq("salon_id", activeSalonId)
          .maybeSingle();
        phoneMapping = mappingRes.data;
      }

      if (!phoneMapping) {
        const fallbackRes = await supabaseAdmin
          .from("phone_document_mapping")
          .select("salon_id, system_prompt, auth_token, origin, gemini_api_key")
          .eq("phone_number", toNumber)
          .maybeSingle();
        phoneMapping = fallbackRes.data;
      }

      const authToken = phoneMapping?.auth_token || process.env.WHATSAPP_AUTH_TOKEN || "demo-token";
      const originWebsite = phoneMapping?.origin || process.env.WHATSAPP_ORIGIN || "https://api.11za.in";
      const geminiKey = phoneMapping?.gemini_api_key || process.env.GEMINI_API_KEY;

      // 3. Persistent Memory Architecture
      const memory = await loadConversationMemory(fromNumber, toNumber, senderName || resolution.customerName || undefined, activeSalonId || undefined);

      // 4. NLU Intent Parsing
      const nluResult = await parseUserMessageNlu(messageText, memory.activeFlow, memory.currentStep, geminiKey);

      // 5. Execute Conversation State Machine
      const stateResult = await processStateMachineStep(memory, messageText, nluResult);
      replyText = stateResult.replyText;

      // 6. Update Memory & 24h Session Record
      stateResult.nextMemory.lastUserMessage = messageText;
      stateResult.nextMemory.lastBotMessage = replyText;
      if (activeSalonId) {
        stateResult.nextMemory.salonId = activeSalonId;
        await upsertWhatsAppSession(fromNumber, activeSalonId, memory.currentStep);
      }
      await saveConversationMemory(stateResult.nextMemory);
    }

    // 7. Send Response via 11za Official API
    const authToken = process.env.WHATSAPP_AUTH_TOKEN || "demo-token";
    const originWebsite = process.env.WHATSAPP_ORIGIN || "https://api.11za.in";

    let sendStatus = false;
    if (replyText) {
      logStep("SENDING_WHATSAPP_REPLY", { to: fromNumber, responseLength: replyText.length, salonId: activeSalonId });
      const sendRes = await sendWhatsAppMessage(fromNumber, replyText, authToken, originWebsite);
      sendStatus = sendRes.success;
    }

    // 8. Mark Message as Responded in Supabase & Attach salon_id
    const updateRecord: any = {
      auto_respond_sent: true,
      response_sent_at: new Date().toISOString(),
    };
    if (activeSalonId) {
      updateRecord.salon_id = activeSalonId;
    }

    await supabaseAdmin
      .from("whatsapp_messages")
      .update(updateRecord)
      .eq("message_id", messageId);

    logStep("AUTO_RESPONDER_SUCCESS", { totalDurationMs: Date.now() - startTime, sent: sendStatus });
    return { success: true, response: replyText, sent: sendStatus };
  } catch (err: any) {
    logError("handleSalonAutoResponse Fatal Error", err);
    return { success: false, error: err.message || "Failed auto response", response: "" };
  }
}

export { handleSalonAutoResponse as generateAutoResponse };