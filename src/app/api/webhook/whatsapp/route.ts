import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { handleSalonAutoResponse, sendWhatsAppMessage } from "@/lib/autoResponder";
import { transcribeAudio } from "../../stt/mistral/route";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    console.log("=== INCOMING WHATSAPP WEBHOOK BODY ===");
    console.log(rawBody);

    let payload: any = {};
    try {
      payload = JSON.parse(rawBody);
    } catch (e) {
      console.error("Failed to parse JSON body:", e);
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

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

    console.log("Extracted Webhook Fields:", {
      messageId,
      fromNumber,
      toNumber,
      messageText,
      senderName,
      eventType,
    });

    if (!fromNumber || !toNumber) {
      console.warn("Webhook missing from/to numbers. Ignoring or logging only.");
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

    const { error: upsertErr } = await supabaseAdmin
      .from("whatsapp_messages")
      .upsert(messageRecord, { onConflict: "message_id" });

    if (upsertErr) {
      console.error("Error logging message to Supabase:", upsertErr);
    }

    // Voice Message handling if audio/voice payload
    const isVoiceMessage =
      payload.content?.contentType === "media" &&
      (payload.content?.media?.type === "audio" || payload.content?.media?.type === "voice");

    if (isVoiceMessage && payload.content?.media?.url) {
      try {
        console.log("Voice note detected. Transcribing audio via Mistral...");
        const audioRes = await fetch(payload.content.media.url);
        if (audioRes.ok) {
          const audioBuffer = await audioRes.arrayBuffer();
          const sttResult = await transcribeAudio(audioBuffer, "voice.ogg");
          if (sttResult?.cleanedTranscript) {
            messageText = sttResult.cleanedTranscript;
            console.log("Transcribed text:", messageText);
          }
        }
      } catch (voiceErr) {
        console.error("Voice transcription error:", voiceErr);
      }
    }

    // Execute Salon AI Auto-Responder for all inbound text messages
    const isOutbound = eventType.toLowerCase() === "mtmessage" || eventType.toLowerCase() === "status";
    if (messageText && !isOutbound) {
      console.log(`Executing Salon AI Auto-Responder for ${fromNumber}...`);
      const responseResult = await handleSalonAutoResponse(
        messageId,
        fromNumber,
        toNumber,
        messageText,
        senderName
      );

      console.log("Auto-Responder Execution Result:", responseResult);

      return NextResponse.json({
        success: true,
        messageId,
        autoResponse: responseResult,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Webhook processed",
      messageId,
    });
  } catch (err: any) {
    console.error("Fatal Webhook Error:", err);
    return NextResponse.json({ error: err.message || "Webhook error" }, { status: 500 });
  }
}

// GET endpoint for 11za / Meta Webhook URL Verification
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

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
