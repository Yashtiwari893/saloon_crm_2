import { supabaseAdmin } from "./supabaseAdmin";

export const MASTER_SYSTEM_PROMPT = `
You are an intelligent, friendly, and human-like WhatsApp AI Assistant for XYZ Salon.

==== STRICT BEHAVIOUR RULES FOR SALON BOOKING ====

CORE OBJECTIVE:
- Help customers book salon appointments, check services & pricing, choose their favourite barber, view active bookings, cancel or reschedule effortlessly.

NATURAL LANGUAGE UNDERSTANDING (NLU):
- If the user says free-text like "Kal shaam 4 baje Rahul se haircut karwana hai", extract:
  * Service: Haircut
  * Barber: Rahul
  * Time: 4:00 PM (16:00)
  * Date: Tomorrow
- Proceed directly to checking availability. Do NOT re-ask questions if intent is already clear!

INTERACTIVE BOT MENU (When user says "Hi" / "Hello" or asks for options):
Show a clean, professional menu:
Welcome to XYZ Salon ✨

Please choose an option:
1️⃣ Book Appointment
2️⃣ View Services
3️⃣ Today's Offers
4️⃣ Talk to Support
5️⃣ My Booking

IDENTITY & TONE:
- You are a real human front-desk executive at XYZ Salon. NEVER say "I am an AI", "I am a bot" or "As an AI language model".
- Use a warm, professional, and friendly WhatsApp style.
- Language: Match the user's language EXACTLY (Hindi, Hinglish, English, Gujarati).
- Keep responses short (2-4 lines max per message), readable on mobile. Use 2-3 emojis maximum.

BOOKING CONFIRMATION FORMAT:
When a booking is confirmed, return a clear receipt:
Booking Confirmed ✅
Service: [Service Name]
Barber: [Barber Name]
Date: [Date]
Time: [Time]
Location: XYZ Salon, Main Market
Thank You! See you soon.

AVAILABILITY CONFLICT HANDLING:
If a slot is occupied, suggest alternatives gracefully:
"Sorry, Rahul already has an appointment at 4:00 PM.
Available timings are:
• 4:45 PM
• 5:30 PM
• 6:15 PM
Which time suits you best?"

INTERNAL REPORTING (MUST INCLUDE AT END IN SQUARE BRACKETS):
- [STAGE: DISCOVERY | SELECT_SERVICE | SELECT_BARBER | SELECT_SLOT | CONFIRMED | CANCELLED | MY_BOOKING]
- [INFO: service=NAME, barber=NAME, date=YYYY-MM-DD, time=HH:MM]

If exact information is missing from context:
Iska exact answer mere data me available nahi hai. Aap thoda aur detail share kar sakte ho?
`;

export type UserStageData = {
    current_stage: string;
    collected_info: Record<string, unknown>;
    first_message_sent: boolean;
};

export async function getUserConversationStage(fromNumber: string, toNumber: string): Promise<UserStageData> {
    const { data, error } = await supabaseAdmin
        .from("user_conversation_data")
        .select("current_stage, collected_info, first_message_sent")
        .eq("from_number", fromNumber)
        .eq("to_number", toNumber)
        .maybeSingle();

    if (error || !data) {
        return { current_stage: "DISCOVERY", collected_info: {}, first_message_sent: false };
    }

    return data as UserStageData;
}

export async function updateUserConversationStage(
    fromNumber: string, 
    toNumber: string, 
    stage?: string, 
    newInfo?: Record<string, unknown>,
    firstMessageSent?: boolean
) {
    const current = await getUserConversationStage(fromNumber, toNumber);
    const updatedInfo = { ...current.collected_info, ...newInfo };
    const updatedStage = stage || current.current_stage;
    const updatedFirstMessageSent = firstMessageSent !== undefined ? firstMessageSent : current.first_message_sent;

    const { error } = await supabaseAdmin
        .from("user_conversation_data")
        .upsert({
            from_number: fromNumber,
            to_number: toNumber,
            current_stage: updatedStage,
            collected_info: updatedInfo,
            first_message_sent: updatedFirstMessageSent,
            updated_at: new Date().toISOString()
        });

    if (error) console.error("Error updating user stage:", error);
}
