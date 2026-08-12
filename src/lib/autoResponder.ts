import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { embedText } from "@/lib/embeddings";
import { retrieveRelevantChunksForPhoneNumber } from "@/lib/retrieval";
import { sendWhatsAppMessage } from "@/lib/whatsappSender";
import { logHeader, logStep, logAiGeneration, logError } from "@/lib/logger";

import {
  loadConversationMemory,
  saveConversationMemory,
  ConversationMemory,
} from "@/lib/conversationMemory";

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
    logHeader(`SALON AI CONVERSATION ENGINE EXECUTING`);
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

    // 1. Fetch Credentials & Tenant Salon ID for 11za WhatsApp API & Gemini AI
    const mappingResult = await supabaseAdmin
      .from("phone_document_mapping")
      .select("salon_id, system_prompt, auth_token, origin, gemini_api_key, groq_api_key, mistral_api_key")
      .eq("phone_number", toNumber)
      .maybeSingle();

    const phoneMapping = mappingResult.data || {
      salon_id: undefined,
      auth_token: process.env.WHATSAPP_AUTH_TOKEN || "demo-token",
      origin: process.env.WHATSAPP_ORIGIN || "https://api.11za.in",
      system_prompt: "",
      gemini_api_key: process.env.GEMINI_API_KEY || "",
      groq_api_key: process.env.GROQ_API_KEY || "",
      mistral_api_key: process.env.MISTRAL_API_KEY || "",
    };

    const targetSalonId = phoneMapping.salon_id || undefined;
    const authToken = phoneMapping.auth_token || process.env.WHATSAPP_AUTH_TOKEN || "";
    const originWebsite = phoneMapping.origin || process.env.WHATSAPP_ORIGIN || "https://api.11za.in";
    const geminiKey = phoneMapping.gemini_api_key || process.env.GEMINI_API_KEY;

    // 2. Persistent Memory Architecture: Load Customer Context & Active Booking Draft for targetSalonId
    const memory = await loadConversationMemory(fromNumber, toNumber, senderName, targetSalonId);

    // 3. NLU Intent & Entity Extraction
    const nluResult = await parseUserMessageNlu(
      messageText,
      memory.activeFlow,
      memory.currentStep,
      geminiKey
    );

    // 4. Conversation State Machine Execution
    const stateResult = await processStateMachineStep(memory, messageText, nluResult);
    const replyText = stateResult.replyText;

    // 5. Update Memory Records with Last Interaction
    stateResult.nextMemory.lastUserMessage = messageText;
    stateResult.nextMemory.lastBotMessage = replyText;
    if (targetSalonId) {
      stateResult.nextMemory.salonId = targetSalonId;
    }
    await saveConversationMemory(stateResult.nextMemory);

    // 6. Send WhatsApp Response via 11za Official API
    let sendStatus = false;
    if (authToken && originWebsite && replyText) {
      logStep("SENDING_WHATSAPP_REPLY_VIA_11ZA", { to: fromNumber, responseLength: replyText.length, salonId: targetSalonId });
      const sendRes = await sendWhatsAppMessage(fromNumber, replyText, authToken, originWebsite);
      sendStatus = sendRes.success;
    } else {
      logError("WhatsApp Send Skipped", { authTokenPresent: Boolean(authToken), originWebsite, replyTextPresent: Boolean(replyText) });
    }

    // 7. Mark Message as Responded in Supabase & Attach salon_id
    const updateRecord: any = {
      auto_respond_sent: true,
      response_sent_at: new Date().toISOString(),
    };
    if (targetSalonId) {
      updateRecord.salon_id = targetSalonId;
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

// Alias export for backward compatibility with routes
export { handleSalonAutoResponse as generateAutoResponse };