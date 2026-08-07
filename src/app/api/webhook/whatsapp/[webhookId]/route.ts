import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { generateAutoResponse } from "@/lib/autoResponder";
import { transcribeAudio, type TranscriptionResult } from "../../../stt/mistral/route";
import { logWebhookIncoming, logStep, logError } from "@/lib/logger";

type WhatsAppWebhookPayload = {
  messageId: string;
  channel: string;
  from: string;
  to: string;
  receivedAt: string;
  content: {
    contentType: string;
    text?: string;
    media?: {
      type: string;
      url: string;
    };
  };
  whatsapp?: {
    senderName?: string;
  };
  timestamp: string;
  event: string;
  isin24window?: boolean;
  isResponded?: boolean;
  UserResponse?: string;
};

async function transcribeVoiceMessage(mediaUrl: string): Promise<{ text: string; result: TranscriptionResult } | null> {
  try {
    const response = await fetch(mediaUrl);
    if (!response.ok) {
      throw new Error(`Failed to download audio: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const result = await transcribeAudio(audioBuffer, "voice-message.ogg");
    const transcription = result.cleanedTranscript || result.rawTranscript;

    if (!transcription) {
      return null;
    }

    return { text: transcription, result };
  } catch (error) {
    console.error("Voice transcription failed:", error);
    return null;
  }
}

async function resolveWebhookMapping(webhookId: string, toNumber?: string) {
  try {
    let query = supabaseAdmin
      .from("phone_document_mapping")
      .select("*");

    if (webhookId && webhookId !== "default" && webhookId !== "11za") {
      query = query.or(`webhook_id.eq.${webhookId},phone_number.eq.${webhookId}`);
    } else if (toNumber) {
      query = query.eq("phone_number", toNumber);
    }

    const { data } = await query.maybeSingle();

    if (data) {
      return { mapping: data, error: null };
    }
  } catch (e) {
    logError("resolveWebhookMapping exception", e);
  }

  // Resilient Fallback mapping using environment variables
  return {
    mapping: {
      phone_number: toNumber || "default",
      auth_token: process.env.WHATSAPP_AUTH_TOKEN || "demo-token",
      origin: process.env.WHATSAPP_ORIGIN || "https://api.11za.in",
      system_prompt: "",
      gemini_api_key: process.env.GEMINI_API_KEY || "",
      groq_api_key: process.env.GROQ_API_KEY || "",
      mistral_api_key: process.env.MISTRAL_API_KEY || "",
      webhook_enabled: true,
    },
    error: null,
  };
}

async function handleIncomingWebhook(req: Request, webhookId: string) {
  const startTime = Date.now();
  const rawBody = await req.text();
  let payload: any = {};
  try {
    payload = JSON.parse(rawBody);
  } catch (e) {
    logError("JSON Parse Error in Dynamic Webhook", { rawBody, error: e });
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const headers: Record<string, string> = {};
  req.headers.forEach((v, k) => { headers[k] = v; });
  logWebhookIncoming(req.method, req.url, headers, payload);

  const messageId = payload.messageId || payload.message_id || payload.id || payload.wamid || `msg_${Date.now()}`;
  const fromNumber = payload.from || payload.from_number || payload.sender || payload.phone || "";
  const toNumber = payload.to || payload.to_number || payload.receiver || payload.recipient || "";
  let messageText = payload.content?.text || payload.text?.body || payload.text || payload.message || payload.UserResponse || payload.body || "";
  const senderName = payload.whatsapp?.senderName || payload.senderName || payload.name || "WhatsApp Client";
  const eventType = payload.event || payload.event_type || "MoMessage";

  logStep("DYNAMIC_WEBHOOK_EXTRACTED_FIELDS", { webhookId, messageId, fromNumber, toNumber, messageText, senderName, eventType });

  if (!fromNumber || !toNumber) {
    logError("Dynamic Webhook Missing Phone Numbers", { fromNumber, toNumber, payload });
    return NextResponse.json({ message: "Payload received but missing phone numbers", payload }, { status: 200 });
  }

  const { mapping } = await resolveWebhookMapping(webhookId, toNumber);

  // Upsert Message record to database
  const messageRecord = {
    message_id: messageId,
    channel: payload.channel || "whatsapp",
    from_number: fromNumber,
    to_number: toNumber,
    received_at: payload.receivedAt || new Date().toISOString(),
    content_type: payload.content?.contentType || "text",
    content_text: messageText,
    sender_name: senderName,
    event_type: eventType,
    is_in_24_window: payload.isin24window || true,
    is_responded: false,
    raw_payload: payload,
  };

  const { error: insertError } = await supabaseAdmin
    .from("whatsapp_messages")
    .upsert(messageRecord, { onConflict: "message_id" });

  if (insertError) {
    logError("Dynamic Webhook Supabase Log Error", insertError);
  }

  // Voice Note Transcription
  const isVoiceMessage = payload.content?.contentType === "media" &&
    (payload.content?.media?.type === "audio" || payload.content?.media?.type === "voice");

  if (isVoiceMessage && payload.content?.media?.url) {
    logStep("VOICE_NOTE_DETECTED", payload.content.media.url);
    const transcriptionResult = await transcribeVoiceMessage(payload.content.media.url);
    if (transcriptionResult) {
      messageText = transcriptionResult.text;
      await supabaseAdmin
        .from("whatsapp_messages")
        .update({
          content_text: messageText,
          raw_transcript: transcriptionResult.result.rawTranscript,
          transcript_language: transcriptionResult.result.language,
          transcript_method: "mistral-stt",
        })
        .eq("message_id", messageId);
    }
  }

  // Execute Auto-Responder Engine
  const isOutbound = eventType.toLowerCase() === "mtmessage" || eventType.toLowerCase() === "status";
  if (messageText && !isOutbound) {
    logStep("EXECUTING_SALON_AI_AUTO_RESPONDER_DYNAMIC", { messageId, fromNumber, toNumber, messageText });
    const autoResponseResult = await generateAutoResponse(
      messageId,
      fromNumber,
      toNumber,
      messageText,
      senderName
    );

    logStep("DYNAMIC_AUTO_RESPONDER_COMPLETE", { durationMs: Date.now() - startTime, result: autoResponseResult });
    return NextResponse.json({ success: true, message: "Webhook processed", autoResponse: autoResponseResult });
  }

  return NextResponse.json({ success: true, message: "Webhook logged", messageId });
}

export async function POST(req: Request, { params }: { params: Promise<{ webhookId: string }> }) {
  try {
    const { webhookId } = await params;
    return await handleIncomingWebhook(req, webhookId);
  } catch (error) {
    logError("WEBHOOK_DYNAMIC_POST_EXCEPTION", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ webhookId: string }> }) {
  const { webhookId } = await params;
  const { searchParams } = new URL(req.url);
  const challenge = searchParams.get("hub.challenge");

  logStep("DYNAMIC_WEBHOOK_GET_VERIFICATION", { webhookId, challenge });

  if (challenge) {
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json({ status: "online", webhookId, timestamp: new Date().toISOString() }, { status: 200 });
}
