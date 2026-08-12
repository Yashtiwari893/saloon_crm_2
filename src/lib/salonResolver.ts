import { supabaseAdmin } from "./supabaseAdmin";
import { normalizePhoneNumber } from "./phoneNormalizer";

export interface SalonResolutionResult {
  salonId: string | null;
  salonName: string | null;
  resolutionType: "DEEP_LINK_QR" | "ACTIVE_SESSION" | "CRM_PHONE_MATCH" | "MULTI_MATCH_FALLBACK" | "NO_MATCH_FALLBACK";
  customerName?: string | null;
  matchedSalons?: { id: string; name: string; slug: string }[];
}

/**
 * 4-Layer Salon Resolution Engine for Single WABA WhatsApp Number (Option D)
 */
export async function resolveSalonContextForIncomingMessage(
  incomingPhone: string,
  messageText: string
): Promise<SalonResolutionResult> {
  const cleanPhone = normalizePhoneNumber(incomingPhone);

  // =========================================================================
  // LAYER 1: Deep Link / QR Prefill Parser
  // Matches "Book AkritiSalon", "Ref: akriti-salon", "Hi akriti"
  // =========================================================================
  if (messageText) {
    const textLower = messageText.toLowerCase().trim();

    // Fetch all active salons to check slug / name match
    const { data: allSalons } = await supabaseAdmin
      .from("salons")
      .select("id, name, slug, login_id")
      .eq("status", "active");

    if (allSalons && allSalons.length > 0) {
      for (const salon of allSalons) {
        const slug = salon.slug.toLowerCase();
        const loginId = (salon.login_id || "").toLowerCase();
        const namePart = salon.name.toLowerCase().replace(/[^a-z0-9]/g, "");

        if (
          textLower.includes(slug) ||
          (loginId && textLower.includes(loginId)) ||
          (namePart.length > 3 && textLower.includes(namePart))
        ) {
          // Update / Create 24h Session in whatsapp_sessions
          await upsertWhatsAppSession(cleanPhone, salon.id, "STEP_0_IDLE");

          return {
            salonId: salon.id,
            salonName: salon.name,
            resolutionType: "DEEP_LINK_QR",
          };
        }
      }
    }
  }

  // =========================================================================
  // LAYER 2: Active 24-Hour Session Check
  // =========================================================================
  try {
    const { data: session } = await supabaseAdmin
      .from("whatsapp_sessions")
      .select("*")
      .eq("phone_number", cleanPhone)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (session && session.active_salon_id) {
      const { data: salon } = await supabaseAdmin
        .from("salons")
        .select("id, name")
        .eq("id", session.active_salon_id)
        .maybeSingle();

      if (salon) {
        return {
          salonId: salon.id,
          salonName: salon.name,
          resolutionType: "ACTIVE_SESSION",
        };
      }
    }
  } catch {
    // Session check fallback
  }

  // =========================================================================
  // LAYER 3: CRM Phone Match Lookup
  // Search customers table by normalized phone_number across all salon tenants
  // =========================================================================
  try {
    const { data: matchedCustomers } = await supabaseAdmin
      .from("customers")
      .select("salon_id, name, salons(id, name, slug)")
      .eq("phone_number", cleanPhone);

    if (matchedCustomers && matchedCustomers.length === 1) {
      const singleMatch = matchedCustomers[0];
      const salonId = singleMatch.salon_id;
      const salonName = (singleMatch.salons as any)?.name || "Salon";

      // Set 24h active session
      await upsertWhatsAppSession(cleanPhone, salonId, "STEP_0_IDLE");

      return {
        salonId: salonId,
        salonName: salonName,
        customerName: singleMatch.name,
        resolutionType: "CRM_PHONE_MATCH",
      };
    } else if (matchedCustomers && matchedCustomers.length > 1) {
      // Customer has visited 2+ salons!
      const uniqueSalonsMap = new Map<string, { id: string; name: string; slug: string }>();
      matchedCustomers.forEach((c: any) => {
        if (c.salons) {
          uniqueSalonsMap.set(c.salons.id, { id: c.salons.id, name: c.salons.name, slug: c.salons.slug });
        }
      });

      return {
        salonId: null,
        salonName: null,
        resolutionType: "MULTI_MATCH_FALLBACK",
        customerName: matchedCustomers[0]?.name,
        matchedSalons: Array.from(uniqueSalonsMap.values()),
      };
    }
  } catch {
    // CRM match fallback
  }

  // =========================================================================
  // LAYER 4: No Match Fallback (New user with plain "Hi")
  // =========================================================================
  const { data: defaultSalons } = await supabaseAdmin
    .from("salons")
    .select("id, name, slug")
    .eq("status", "active")
    .limit(5);

  return {
    salonId: null,
    salonName: null,
    resolutionType: "NO_MATCH_FALLBACK",
    matchedSalons: defaultSalons || [],
  };
}

/**
 * Upsert 24-hour WhatsApp session record
 */
export async function upsertWhatsAppSession(
  phone: string,
  salonId: string,
  step: string,
  draftBooking?: any
) {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 Hours TTL

  try {
    await supabaseAdmin.from("whatsapp_sessions").upsert(
      {
        phone_number: phone,
        active_salon_id: salonId,
        current_step: step,
        draft_booking: draftBooking ? JSON.stringify(draftBooking) : null,
        expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "phone_number" }
    );
  } catch (err) {
    console.warn("Session upsert fallback:", err);
  }
}
