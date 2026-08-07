import { supabaseAdmin } from "./supabaseAdmin";
import { sendWhatsAppMessage } from "./whatsappSender";

/**
 * Process automated appointment reminders (24h, 2h, 30m before appointment)
 */
export async function processUpcomingReminders() {
  try {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
    const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();

    // Fetch confirmed upcoming bookings for today
    const { data: bookings, error } = await supabaseAdmin
      .from("bookings")
      .select(`
        id,
        booking_code,
        booking_date,
        start_time,
        total_price,
        reminder_24h_sent,
        reminder_2h_sent,
        reminder_30m_sent,
        customers (name, whatsapp_number),
        barbers (name),
        salons (name, whatsapp_auth_token, whatsapp_origin),
        booking_services (service_name)
      `)
      .eq("status", "confirmed")
      .gte("booking_date", todayStr);

    if (error || !bookings || bookings.length === 0) {
      return { processed: 0, sent: 0 };
    }

    let sentCount = 0;

    for (const b of bookings) {
      const customer = Array.isArray(b.customers) ? b.customers[0] : b.customers;
      const barber = Array.isArray(b.barbers) ? b.barbers[0] : b.barbers;
      const salon = Array.isArray(b.salons) ? b.salons[0] : b.salons;
      const services = b.booking_services || [];
      const serviceNames = services.map((s: any) => s.service_name).join(", ") || "Haircut";

      if (!customer?.whatsapp_number || !salon?.whatsapp_auth_token || !salon?.whatsapp_origin) {
        continue;
      }

      const bookingTimeMinutes = parseTimeToMinutes(b.start_time);
      const diffMinutes = bookingTimeMinutes - currentTimeMinutes;

      let shouldSendReminder = false;
      let reminderType: '30m' | '2h' | '24h' = '30m';

      // 30 minutes before (between 15m and 35m)
      if (diffMinutes >= 15 && diffMinutes <= 35 && !b.reminder_30m_sent) {
        shouldSendReminder = true;
        reminderType = '30m';
      }
      // 2 hours before (between 105m and 135m)
      else if (diffMinutes >= 105 && diffMinutes <= 135 && !b.reminder_2h_sent) {
        shouldSendReminder = true;
        reminderType = '2h';
      }

      if (shouldSendReminder) {
        const timeText = reminderType === '30m' ? '30 minutes' : '2 hours';
        const message = 
`Reminder: Your appointment is in ${timeText}! ⏰

Salon: ${salon.name || 'XYZ Salon'}
Service: ${serviceNames}
Barber: ${barber?.name || 'Rahul'}
Time: ${b.start_time}

We look forward to serving you! Reply 'Cancel' if you need to reschedule.`;

        const result = await sendWhatsAppMessage(
          customer.whatsapp_number,
          message,
          salon.whatsapp_auth_token,
          salon.whatsapp_origin
        );

        if (result.success) {
          sentCount++;
          const updateData: any = {};
          if (reminderType === '30m') updateData.reminder_30m_sent = true;
          if (reminderType === '2h') updateData.reminder_2h_sent = true;

          await supabaseAdmin
            .from("bookings")
            .update(updateData)
            .eq("id", b.id);
        }
      }
    }

    return { processed: bookings.length, sent: sentCount };
  } catch (err) {
    console.error("Error processing reminders:", err);
    return { processed: 0, sent: 0, error: String(err) };
  }
}

function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.split(":");
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1] || "0", 10);
}
