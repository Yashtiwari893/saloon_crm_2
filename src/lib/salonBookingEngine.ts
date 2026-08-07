import { supabaseAdmin } from "./supabaseAdmin";
import { Booking, Barber, Service, Customer } from "@/types/salon";
import { SALON_UUID } from "./salonStore";

export interface SlotAvailabilityResult {
  isAvailable: boolean;
  reason?: string;
  barber?: Barber;
  service?: Service;
  requestedDate: string;
  requestedTime: string;
  endTime?: string;
  alternativeSlots?: string[];
  alternativeBarbers?: { id: string; name: string }[];
}

/**
 * Format time helper: HH:mm to minutes from midnight
 */
export function timeToMinutes(timeStr: string): number {
  const parts = timeStr.split(":");
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1] || "0", 10);
  return hours * 60 + minutes;
}

/**
 * Convert minutes from midnight to HH:mm format
 */
export function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const hStr = hours.toString().padStart(2, "0");
  const mStr = minutes.toString().padStart(2, "0");
  return `${hStr}:${mStr}`;
}

/**
 * Check if a barber is available for a requested date, time, and service duration
 */
export async function checkSlotAvailability(
  barberId: string,
  serviceDurationMinutes: number,
  requestedDateStr: string, // YYYY-MM-DD
  requestedTimeStr: string  // HH:mm
): Promise<SlotAvailabilityResult> {
  try {
    // 1. Fetch Barber details
    const { data: barber, error: barberErr } = await supabaseAdmin
      .from("barbers")
      .select("*")
      .eq("id", barberId)
      .maybeSingle();

    if (barberErr || !barber) {
      return {
        isAvailable: false,
        reason: "Barber not found or inactive.",
        requestedDate: requestedDateStr,
        requestedTime: requestedTimeStr,
      };
    }

    if (barber.status === "off" || barber.status === "inactive") {
      return {
        isAvailable: false,
        reason: `${barber.name} is currently off or inactive today.`,
        requestedDate: requestedDateStr,
        requestedTime: requestedTimeStr,
      };
    }

    // 2. Check Barber Weekly Off
    const dateObj = new Date(requestedDateStr);
    const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 1 = Monday...
    if (barber.weekly_off_day === dayOfWeek) {
      return {
        isAvailable: false,
        reason: `${barber.name} has weekly off on this day.`,
        requestedDate: requestedDateStr,
        requestedTime: requestedTimeStr,
      };
    }

    // 3. Check Barber Leave
    const { data: leave } = await supabaseAdmin
      .from("barber_leaves")
      .select("id")
      .eq("barber_id", barberId)
      .eq("leave_date", requestedDateStr)
      .eq("status", "approved")
      .maybeSingle();

    if (leave) {
      return {
        isAvailable: false,
        reason: `${barber.name} is on leave on ${requestedDateStr}.`,
        requestedDate: requestedDateStr,
        requestedTime: requestedTimeStr,
      };
    }

    // 4. Check Working Hours
    const reqStartMin = timeToMinutes(requestedTimeStr);
    const reqEndMin = reqStartMin + serviceDurationMinutes;
    const barberStartMin = timeToMinutes(barber.start_time || "09:30");
    const barberEndMin = timeToMinutes(barber.end_time || "20:30");

    if (reqStartMin < barberStartMin || reqEndMin > barberEndMin) {
      return {
        isAvailable: false,
        reason: `${barber.name}'s working hours are ${barber.start_time} to ${barber.end_time}.`,
        requestedDate: requestedDateStr,
        requestedTime: requestedTimeStr,
      };
    }

    // 5. Check overlapping active bookings for this barber
    const { data: existingBookings, error: bookingErr } = await supabaseAdmin
      .from("bookings")
      .select("id, start_time, end_time, status")
      .eq("barber_id", barberId)
      .eq("booking_date", requestedDateStr)
      .in("status", ["confirmed", "in_progress", "pending"]);

    let hasOverlap = false;
    if (existingBookings && existingBookings.length > 0) {
      for (const b of existingBookings) {
        const bStartMin = timeToMinutes(b.start_time);
        const bEndMin = timeToMinutes(b.end_time);

        // Overlap condition
        if (
          (reqStartMin >= bStartMin && reqStartMin < bEndMin) ||
          (reqEndMin > bStartMin && reqEndMin <= bEndMin) ||
          (reqStartMin <= bStartMin && reqEndMin >= bEndMin)
        ) {
          hasOverlap = true;
          break;
        }
      }
    }

    const calculatedEndTime = minutesToTime(reqEndMin);

    if (hasOverlap) {
      // Find alternative slots for the same barber
      const alternatives = await findAlternativeSlots(
        barberId,
        serviceDurationMinutes,
        requestedDateStr,
        requestedTimeStr,
        existingBookings || []
      );

      return {
        isAvailable: false,
        reason: `${barber.name} already has an appointment around ${requestedTimeStr}.`,
        barber,
        requestedDate: requestedDateStr,
        requestedTime: requestedTimeStr,
        alternativeSlots: alternatives,
      };
    }

    return {
      isAvailable: true,
      barber,
      requestedDate: requestedDateStr,
      requestedTime: requestedTimeStr,
      endTime: calculatedEndTime,
    };
  } catch (err) {
    console.error("Error checking slot availability:", err);
    return {
      isAvailable: false,
      reason: "Internal server error checking availability.",
      requestedDate: requestedDateStr,
      requestedTime: requestedTimeStr,
    };
  }
}

/**
 * Find 3-4 next available slots for a barber on a given day
 */
async function findAlternativeSlots(
  barberId: string,
  durationMinutes: number,
  dateStr: string,
  baseTimeStr: string,
  existingBookings: any[]
): Promise<string[]> {
  const alternatives: string[] = [];
  const baseMinutes = timeToMinutes(baseTimeStr);

  for (let offset = 15; offset <= 180; offset += 15) {
    if (alternatives.length >= 3) break;

    const candidateStartMin = baseMinutes + offset;
    const candidateEndMin = candidateStartMin + durationMinutes;

    if (candidateEndMin > timeToMinutes("20:30")) break;

    let overlap = false;
    for (const b of existingBookings) {
      const bStartMin = timeToMinutes(b.start_time);
      const bEndMin = timeToMinutes(b.end_time);

      if (
        (candidateStartMin >= bStartMin && candidateStartMin < bEndMin) ||
        (candidateEndMin > bStartMin && candidateEndMin <= bEndMin) ||
        (candidateStartMin <= bStartMin && candidateEndMin >= bEndMin)
      ) {
        overlap = true;
        break;
      }
    }

    if (!overlap) {
      alternatives.push(minutesToTime(candidateStartMin));
    }
  }

  return alternatives;
}

/**
 * Atomic booking creation helper
 */
export async function createSalonBooking(params: {
  salonId?: string;
  customerName: string;
  customerPhone: string;
  whatsappNumber: string;
  barberId: string;
  serviceId: string;
  bookingDate: string; // YYYY-MM-DD
  startTime: string;   // HH:mm
  source?: 'whatsapp' | 'walk_in' | 'phone' | 'web';
  whatsappMessageId?: string;
  notes?: string;
}) {
  try {
    // 1. Get Service Details
    const { data: service, error: sErr } = await supabaseAdmin
      .from("services")
      .select("*")
      .eq("id", params.serviceId)
      .single();

    if (sErr || !service) throw new Error("Service not found");

    // 2. Get Barber Details
    const { data: barber, error: bErr } = await supabaseAdmin
      .from("barbers")
      .select("*")
      .eq("id", params.barberId)
      .single();

    if (bErr || !barber) throw new Error("Barber not found");

    const salonId = params.salonId || barber.salon_id || SALON_UUID;

    // 3. Re-verify Slot Availability
    const check = await checkSlotAvailability(
      params.barberId,
      service.duration_minutes,
      params.bookingDate,
      params.startTime
    );

    if (!check.isAvailable) {
      return {
        success: false,
        error: check.reason || "Slot not available",
        alternativeSlots: check.alternativeSlots,
      };
    }

    const endTime = check.endTime || minutesToTime(timeToMinutes(params.startTime) + service.duration_minutes);

    // 4. Find or Create Customer
    let { data: customer } = await supabaseAdmin
      .from("customers")
      .select("*")
      .eq("salon_id", salonId)
      .eq("whatsapp_number", params.whatsappNumber)
      .maybeSingle();

    if (!customer) {
      const { data: newCustomer, error: cErr } = await supabaseAdmin
        .from("customers")
        .insert({
          salon_id: salonId,
          name: params.customerName || "Salon Customer",
          phone_number: params.customerPhone || params.whatsappNumber,
          whatsapp_number: params.whatsappNumber,
          gender: "unspecified",
          total_visits: 1,
          total_spend: service.price,
          loyalty_points: Math.floor(service.price / 10),
          last_visit_at: new Date().toISOString(),
          favourite_barber_id: params.barberId,
        })
        .select()
        .single();

      if (cErr) throw cErr;
      customer = newCustomer;
    } else {
      await supabaseAdmin
        .from("customers")
        .update({
          total_visits: (customer.total_visits || 0) + 1,
          total_spend: (Number(customer.total_spend) || 0) + Number(service.price),
          loyalty_points: (customer.loyalty_points || 0) + Math.floor(service.price / 10),
          last_visit_at: new Date().toISOString(),
          favourite_barber_id: params.barberId,
        })
        .eq("id", customer.id);
    }

    const bookingCode = `BK-${Math.floor(1000 + Math.random() * 9000)}`;

    const { data: booking, error: bookErr } = await supabaseAdmin
      .from("bookings")
      .insert({
        salon_id: salonId,
        booking_code: bookingCode,
        customer_id: customer.id,
        barber_id: params.barberId,
        booking_date: params.bookingDate,
        start_time: params.startTime,
        end_time: endTime,
        total_duration_minutes: service.duration_minutes,
        total_price: service.price,
        status: "confirmed",
        source: params.source || "whatsapp",
        whatsapp_message_id: params.whatsappMessageId,
        notes: params.notes,
      })
      .select()
      .single();

    if (bookErr) throw bookErr;

    await supabaseAdmin.from("booking_services").insert({
      booking_id: booking.id,
      service_id: service.id,
      service_name: service.name,
      duration_minutes: service.duration_minutes,
      price: service.price,
    });

    await supabaseAdmin.from("notifications").insert({
      salon_id: salonId,
      title: "New WhatsApp Booking!",
      message: `${customer.name} booked ${service.name} with ${barber.name} for ${params.bookingDate} at ${params.startTime}`,
      type: "booking",
      link_url: "/bookings",
    });

    return {
      success: true,
      booking: {
        ...booking,
        customerName: customer.name,
        barberName: barber.name,
        serviceName: service.name,
      },
    };
  } catch (err: any) {
    console.error("Failed to create salon booking:", err);
    return {
      success: false,
      error: err.message || "Failed to create appointment.",
    };
  }
}

/**
 * Cancel an existing booking
 */
export async function cancelSalonBooking(whatsappNumber: string, reason?: string) {
  try {
    const { data: customer } = await supabaseAdmin
      .from("customers")
      .select("id, name")
      .eq("whatsapp_number", whatsappNumber)
      .maybeSingle();

    if (!customer) return { success: false, error: "No customer profile found." };

    const { data: booking } = await supabaseAdmin
      .from("bookings")
      .select("*, barbers(name)")
      .eq("customer_id", customer.id)
      .in("status", ["confirmed", "pending"])
      .order("booking_date", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!booking) {
      return { success: false, error: "No active upcoming booking found to cancel." };
    }

    await supabaseAdmin
      .from("bookings")
      .update({
        status: "cancelled",
        cancellation_reason: reason || "Cancelled via WhatsApp Chatbot",
        updated_at: new Date().toISOString(),
      })
      .eq("id", booking.id);

    await supabaseAdmin.from("notifications").insert({
      salon_id: booking.salon_id,
      title: "Booking Cancelled",
      message: `${customer.name} cancelled appointment for ${booking.booking_date} at ${booking.start_time}`,
      type: "cancellation",
      link_url: "/bookings",
    });

    return {
      success: true,
      cancelledBooking: booking,
    };
  } catch (err: any) {
    console.error("Error cancelling booking:", err);
    return { success: false, error: "Failed to cancel booking." };
  }
}

/**
 * Fetch latest active booking for "My Booking"
 */
export async function getCustomerLatestBooking(whatsappNumber: string) {
  try {
    const { data: customer } = await supabaseAdmin
      .from("customers")
      .select("id, name")
      .eq("whatsapp_number", whatsappNumber)
      .maybeSingle();

    if (!customer) return null;

    const { data: booking } = await supabaseAdmin
      .from("bookings")
      .select(`
        *,
        barbers (name, avatar_url),
        booking_services (service_name, price, duration_minutes)
      `)
      .eq("customer_id", customer.id)
      .order("booking_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    return booking;
  } catch (err) {
    console.error("Error fetching latest booking:", err);
    return null;
  }
}
