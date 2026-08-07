import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { generateAutoResponse, sendWhatsAppMessage } from "@/lib/autoResponder";
import { transcribeAudio, type TranscriptionResult } from "../../../stt/mistral/route";

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

function getWebhookToken(req: Request) {
  const url = new URL(req.url);
  return req.headers.get("x-webhook-token") || req.headers.get("x-11za-webhook-token") || url.searchParams.get("token");
}

async function resolveWebhookMapping(webhookId: string) {
  const { data, error } = await supabaseAdmin
    .from("phone_document_mapping")
    .select("id, user_id, phone_number, auth_token, origin, webhook_secret, webhook_enabled, webhook_last_verified_at, webhook_last_received_at")
    .eq("webhook_id", webhookId)
    .maybeSingle();

  if (error || !data) {
    return { mapping: null, error };
  }

  return { mapping: data, error: null };
}

async function handleIncomingWebhook(req: Request, webhookId: string) {
  const rawBody = await req.text();
  let payload: any = {};
  try {
    payload = JSON.parse(rawBody);
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const messageId = payload.messageId || payload.message_id || payload.id || `msg_${Date.now()}`;
  const fromNumber = payload.from || payload.from_number || payload.sender || "";
  const toNumber = payload.to || payload.to_number || payload.receiver || "";
  let messageText = payload.content?.text || payload.text || payload.message || payload.UserResponse || "";
  const senderName = payload.whatsapp?.senderName || payload.senderName || "WhatsApp Client";

  if (!fromNumber || !toNumber) {
    return NextResponse.json({ error: "Missing from/to numbers" }, { status: 400 });
  }

  const { mapping, error } = await resolveWebhookMapping(webhookId);
  if (error || !mapping) {
    return NextResponse.json({ error: "Webhook not found" }, { status: 404 });
  }

  if (mapping.webhook_enabled === false) {
    return NextResponse.json({ error: "Webhook disabled" }, { status: 403 });
  }

  const providedToken = getWebhookToken(req);
  if (mapping.webhook_secret && providedToken !== mapping.webhook_secret) {
    return NextResponse.json({ error: "Invalid webhook token" }, { status: 401 });
  }

  const { data, error: insertError } = await supabaseAdmin
    .from("whatsapp_messages")
    .upsert(
      {
        message_id: messageId,
        channel: payload.channel || "whatsapp",
        from_number: fromNumber,
        to_number: toNumber,
        received_at: payload.receivedAt || new Date().toISOString(),
        content_type: payload.content?.contentType || "text",
        content_text: messageText,
        sender_name: senderName,
        event_type: payload.event || "MoMessage",
        is_in_24_window: payload.isin24window || false,
        is_responded: payload.isResponded || false,
        raw_payload: payload,
        user_id: mapping.user_id,
      },
      { onConflict: "message_id", ignoreDuplicates: false }
    )
    .select();

  if (insertError) {
    console.error("Error inserting message log:", insertError);
  }

  const isVoiceMessage = payload.content?.contentType === "media" &&
    (payload.content?.media?.type === "audio" || payload.content?.media?.type === "voice");

  if (isVoiceMessage && payload.content?.media?.url) {
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

  if (messageText && (payload.event === "MoMessage" || !payload.event)) {
    const autoResponseResult = await generateAutoResponse(
      messageId,
      fromNumber,
      toNumber,
      messageText,
      senderName
    );

    return NextResponse.json({ success: true, message: "Webhook processed", autoResponse: autoResponseResult });
  }

  return NextResponse.json({ success: true, message: "Webhook processed", data: data?.[0] });
}

export async function POST(req: Request, { params }: { params: Promise<{ webhookId: string }> }) {
  try {
    const { webhookId } = await params;
    return await handleIncomingWebhook(req, webhookId);
  } catch (error) {
    console.error("WEBHOOK_DYNAMIC_ERROR:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ webhookId: string }> }) {
  const { webhookId } = await params;
  const { searchParams } = new URL(req.url);
  const challenge = searchParams.get("hub.challenge");

  const { mapping } = await resolveWebhookMapping(webhookId);
  if (!mapping) {
    return NextResponse.json({ error: "Webhook not found" }, { status: 404 });
  }

  if (challenge) {
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json({ status: "online", webhookId }, { status: 200 });
}
