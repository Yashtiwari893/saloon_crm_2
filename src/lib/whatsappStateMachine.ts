import { supabaseAdmin } from "./supabaseAdmin";

export type BookingFlowStep =
  | "STEP_0_IDLE"
  | "STEP_1_SALON_SELECT"
  | "STEP_2_SERVICE_SELECT"
  | "STEP_3_BARBER_SELECT"
  | "STEP_4_SLOT_SELECT"
  | "STEP_5_CONFIRM"
  | "STEP_6_TALK_TO_STAFF";

export interface WhatsAppSessionData {
  id?: string;
  phone_number: string;
  active_salon_id: string | null;
  current_step: BookingFlowStep;
  draft_booking?: {
    service_id?: string;
    service_name?: string;
    service_price?: number;
    barber_id?: string;
    barber_name?: string;
    booking_date?: string;
    booking_time?: string;
    customer_name?: string;
  } | null;
  expires_at: string;
}

/**
 * Fetch current session for customer phone number
 */
export async function getWhatsAppSession(phone: string): Promise<WhatsAppSessionData | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from("whatsapp_sessions")
      .select("*")
      .eq("phone_number", phone)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (error || !data) return null;

    let parsedDraft = null;
    if (data.draft_booking) {
      try {
        parsedDraft = typeof data.draft_booking === "string" ? JSON.parse(data.draft_booking) : data.draft_booking;
      } catch {
        parsedDraft = null;
      }
    }

    return {
      id: data.id,
      phone_number: data.phone_number,
      active_salon_id: data.active_salon_id,
      current_step: data.current_step as BookingFlowStep,
      draft_booking: parsedDraft,
      expires_at: data.expires_at,
    };
  } catch {
    return null;
  }
}

/**
 * Update active step and draft booking payload for current session
 */
export async function updateWhatsAppSessionStep(
  phone: string,
  salonId: string,
  nextStep: BookingFlowStep,
  draftData?: any
) {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  try {
    await supabaseAdmin.from("whatsapp_sessions").upsert(
      {
        phone_number: phone,
        active_salon_id: salonId,
        current_step: nextStep,
        draft_booking: draftData ? JSON.stringify(draftData) : null,
        expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "phone_number" }
    );
  } catch (err) {
    console.warn("Session step update warning:", err);
  }
}

/**
 * Reset / Clear customer session back to idle
 */
export async function clearWhatsAppSession(phone: string) {
  try {
    await supabaseAdmin
      .from("whatsapp_sessions")
      .delete()
      .eq("phone_number", phone);
  } catch {
    // Delete fallback
  }
}
