import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { handleSalonAutoResponse } from "@/lib/autoResponder";
import { transcribeAudio } from "../../stt/mistral/route";
import { logWebhookIncoming, logStep, logError } from "@/lib/logger";

export async function POST(req: Request) {
  const startTime = Date.now();
  try {
    const rawBody = await req.text();
    let payload: any = {};
    try {
      payload = JSON.parse(rawBody);
    } catch (e) {
      logError("Webhook JSON Parse Error", { rawBody, error: e });
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      headers[key] = value;
    });

    logWebhookIncoming(req.method, req.url, headers, payload);

    // Flexible extraction to support 11za, Meta Cloud API, WATI, & Baileys formats
    const messageId =
      payload.messageId ||
      payload.message_id ||
      payload.id ||
      payload.wamid ||
      `msg_${Date.now()}`;

    const fromNumber =
      payload.from ||
      payload.from_number ||
      payload.sender ||
      payload.phone ||
      payload.mobile ||
      "";

    const toNumber =
      payload.to ||
      payload.to_number ||
      payload.receiver ||
      payload.recipient ||
      "";

    let messageText =
      payload.content?.text ||
      payload.text?.body ||
      payload.text ||
      payload.message ||
      payload.UserResponse ||
      payload.body ||
      "";

    const senderName =
      payload.whatsapp?.senderName ||
      payload.senderName ||
      payload.name ||
      "WhatsApp Client";

    const eventType = payload.event || payload.event_type || "MoMessage";

    logStep("EXTRACTED_WEBHOOK_FIELDS", {
      messageId,
      fromNumber,
      toNumber,
      messageText,
      senderName,
      eventType,
    });

    if (!fromNumber || !toNumber) {
      logError("Webhook Missing Phone Numbers", { fromNumber, toNumber, payload });
      return NextResponse.json(
        { message: "Logged payload but missing phone numbers", payload },
        { status: 200 }
      );
    }

    // Save/Upsert message log to Supabase Database
    const messageRecord = {
      message_id: messageId,
      channel: payload.channel || "whatsapp",
      from_number: fromNumber,
      to_number: toNumber,
      content_type: payload.content?.contentType || "text",
      content_text: messageText,
      sender_name: senderName,
      event_type: eventType,
      is_in_24_window: true,
      is_responded: false,
      raw_payload: payload,
    };

    logStep("SUPABASE_MESSAGE_LOGGING", messageRecord);
    const { error: upsertErr } = await supabaseAdmin
      .from("whatsapp_messages")
      .upsert(messageRecord, { onConflict: "message_id" });

    if (upsertErr) {
      logError("Supabase Message Upsert Error", upsertErr);
    }

    // Voice Message handling if audio/voice payload
    const isVoiceMessage =
      payload.content?.contentType === "media" &&
      (payload.content?.media?.type === "audio" || payload.content?.media?.type === "voice");

    if (isVoiceMessage && payload.content?.media?.url) {
      try {
        logStep("VOICE_NOTE_TRANSCRIPTION_START", payload.content.media.url);
        const audioRes = await fetch(payload.content.media.url);
        if (audioRes.ok) {
          const audioBuffer = await audioRes.arrayBuffer();
          const sttResult = await transcribeAudio(audioBuffer, "voice.ogg");
          if (sttResult?.cleanedTranscript) {
            messageText = sttResult.cleanedTranscript;
            logStep("VOICE_NOTE_TRANSCRIPTION_SUCCESS", messageText);
          }
        }
      } catch (voiceErr) {
        logError("Voice Transcription Error", voiceErr);
      }
    }

    // Execute Salon AI Auto-Responder for all inbound text messages
    const isOutbound = eventType.toLowerCase() === "mtmessage" || eventType.toLowerCase() === "status";
    if (messageText && !isOutbound) {
      logStep("EXECUTING_SALON_AI_AUTO_RESPONDER", { fromNumber, toNumber, messageText });
      const responseResult = await handleSalonAutoResponse(
        messageId,
        fromNumber,
        toNumber,
        messageText,
        senderName
      );

      logStep("AUTO_RESPONDER_COMPLETE", { durationMs: Date.now() - startTime, result: responseResult });

      return NextResponse.json({
        success: true,
        messageId,
        autoResponse: responseResult,
      });
    }

    logStep("WEBHOOK_PROCESSED_NO_RESPONSE_NEEDED", { eventType, isOutbound });
    return NextResponse.json({
      success: true,
      message: "Webhook processed",
      messageId,
    });
  } catch (err: any) {
    logError("Fatal Webhook Route Handler Error", err);
    return NextResponse.json({ error: err.message || "Webhook error" }, { status: 500 });
  }
}

// GET endpoint for 11za / Meta Webhook URL Verification
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  logStep("WEBHOOK_GET_VERIFICATION", { mode, token, challenge });

  if (mode === "subscribe" && challenge) {
    console.log("Meta/11za Webhook URL verified successfully!");
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json({
    status: "online",
    message: "Salon WhatsApp Webhook Endpoint Active",
    timestamp: new Date().toISOString(),
  });
}
