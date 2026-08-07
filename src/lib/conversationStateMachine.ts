import { ConversationMemory, saveConversationMemory } from "./conversationMemory";
import { NluParseResult } from "./nluEngine";
import { supabaseAdmin } from "./supabaseAdmin";
import { createSalonBooking, cancelSalonBooking, getCustomerLatestBooking } from "./salonBookingEngine";
import { logStep, logError } from "./logger";

export interface StateMachineResponse {
  replyText: string;
  nextMemory: ConversationMemory;
  flowCompleted?: boolean;
}

const INACTIVITY_THRESHOLD_MS = 15 * 60 * 1000; // 15 Minutes

/**
 * Main Flow State Machine Processor
 */
export async function processStateMachineStep(
  memory: ConversationMemory,
  userMessage: string,
  nlu: NluParseResult
): Promise<StateMachineResponse> {
  logStep("STATE_MACHINE_INPUT", {
    activeFlow: memory.activeFlow,
    currentStep: memory.currentStep,
    userMessage,
    nluIntent: nlu.intent,
    nluEntities: nlu.entities,
  });

  const now = Date.now();
  const lastActive = new Date(memory.lastInteractionAt).getTime();
  const isInactive = now - lastActive > INACTIVITY_THRESHOLD_MS;

  // 1. GLOBAL COMMAND INTERCEPTOR ("Menu", "Cancel", "Support", "Help")
  if (nlu.intent === "GLOBAL_COMMAND" || nlu.entities.commandAction) {
    const cmd = nlu.entities.commandAction || "menu";

    if (cmd === "menu" || cmd === "reset") {
      memory.activeFlow = "WELCOME";
      memory.currentStep = "MAIN_MENU";
      memory.draftBooking = {};
      memory.flowStatus = "active";
      await saveConversationMemory(memory);

      const menuText = 
`Welcome to Velvety Salon ✨

How can I help you today?
1️⃣ Book Appointment
2️⃣ View Services Catalog
3️⃣ Today's Special Offers
4️⃣ Talk to Support Manager
5️⃣ My Active Booking

Reply with a number or tell us what you'd like to do!`;
      return { replyText: menuText, nextMemory: memory };
    }

    if (cmd === "support") {
      const supportText = `📞 Salon Manager Support:\nOur salon manager is available at +91 9005300803. You can call directly or type your message here!`;
      return { replyText: supportText, nextMemory: memory };
    }
  }

  // 2. INACTIVITY RESUME CHECK ("Welcome Back! Resume booking?")
  if (
    isInactive &&
    memory.activeFlow === "BOOKING_DRAFT" &&
    memory.draftBooking.service &&
    memory.currentStep !== "RESUME_CONFIRMATION"
  ) {
    memory.previousStep = memory.currentStep;
    memory.currentStep = "RESUME_CONFIRMATION";
    await saveConversationMemory(memory);

    const customerName = memory.customerProfile.name || "there";
    const resumeText = 
`Welcome back ${customerName} 👋

Your booking is still in progress:
✂️ Service: ${memory.draftBooking.service || "Haircut"}
${memory.draftBooking.barber ? `💈 Barber: ${memory.draftBooking.barber}` : ""}

Would you like to continue where you left off?
1️⃣ Yes, Continue
2️⃣ No, Start New Booking`;

    return { replyText: resumeText, nextMemory: memory };
  }

  // Handle Resume Decision
  if (memory.currentStep === "RESUME_CONFIRMATION") {
    if (nlu.entities.confirmationAction === "yes" || nlu.entities.commandAction === "resume_yes") {
      memory.currentStep = memory.previousStep || "SELECT_BARBER";
      memory.previousStep = "RESUME_CONFIRMATION";
      await saveConversationMemory(memory);
      return await continueBookingFlow(memory, userMessage, nlu);
    } else {
      memory.activeFlow = "WELCOME";
      memory.currentStep = "MAIN_MENU";
      memory.draftBooking = {};
      await saveConversationMemory(memory);

      const restartText = `No problem! Starting fresh. What would you like to do?\n1️⃣ Book Appointment\n2️⃣ View Services`;
      return { replyText: restartText, nextMemory: memory };
    }
  }

  // 3. CANCEL BOOKING INTENT
  if (nlu.intent === "CANCEL_BOOKING") {
    const cancelRes = await cancelSalonBooking(memory.fromNumber);
    memory.activeFlow = "WELCOME";
    memory.currentStep = "MAIN_MENU";
    memory.draftBooking = {};
    await saveConversationMemory(memory);

    let replyText = "";
    if (cancelRes.success) {
      replyText = "Aapki active booking cancel ho gayi hai ✅ Slot free kar diya gaya hai. Phir se book karne ke liye 'Hi' bhejein!";
    } else {
      replyText = cancelRes.error || "Aapki active booking nahi mili cancel karne ke liye.";
    }
    return { replyText, nextMemory: memory };
  }

  // 4. VIEW MY BOOKINGS INTENT
  if (nlu.intent === "VIEW_MY_BOOKINGS") {
    const booking = await getCustomerLatestBooking(memory.fromNumber);
    let replyText = "";
    if (!booking) {
      replyText = "Aapki koi active booking nahi mili! 1️⃣ Type karke new appointment book karein.";
    } else {
      replyText = 
`Your Active Booking 📅

Booking ID: ${booking.booking_code}
Barber: ${booking.barbers?.name || 'Rahul'}
Date: ${booking.booking_date}
Time: ${booking.start_time}
Status: ${booking.status.toUpperCase()}
Total: ₹${booking.total_price}

To cancel, reply 'Cancel Booking'.`;
    }
    return { replyText, nextMemory: memory };
  }

  // 5. BOOKING FLOW CONTROLLER
  if (
    nlu.intent === "START_BOOKING" ||
    memory.activeFlow === "BOOKING_DRAFT" ||
    nlu.intent === "SELECT_SERVICE" ||
    nlu.intent === "SELECT_BARBER" ||
    nlu.intent === "SELECT_DATE_TIME"
  ) {
    memory.activeFlow = "BOOKING_DRAFT";
    return await continueBookingFlow(memory, userMessage, nlu);
  }

  // DEFAULT / UNHANDLED: Ask Gemini or Re-prompt current step
  return await handleFallbackResponse(memory, userMessage);
}

/**
 * Step-by-Step Booking Flow State Machine
 */
async function continueBookingFlow(
  memory: ConversationMemory,
  userMessage: string,
  nlu: NluParseResult
): Promise<StateMachineResponse> {
  const draft = memory.draftBooking;

  // Extract any entity present in user message
  if (nlu.entities.serviceName) draft.service = nlu.entities.serviceName;
  if (nlu.entities.barberName) draft.barber = nlu.entities.barberName;
  if (nlu.entities.dateText) draft.date = nlu.entities.dateText;
  if (nlu.entities.timeText) draft.time = nlu.entities.timeText;

  // STEP A: SERVICE SELECTION
  if (!draft.service) {
    memory.currentStep = "SELECT_SERVICE";
    await saveConversationMemory(memory);

    const { data: services } = await supabaseAdmin
      .from("services")
      .select("name, price, category")
      .eq("is_active", true)
      .limit(6);

    let serviceList = "";
    if (services && services.length > 0) {
      serviceList = services.map((s, idx) => `${idx + 1}. ${s.name} - ₹${s.price}`).join("\n");
    } else {
      serviceList = "1. Haircut & Styling - ₹250\n2. Beard Trim & Styling - ₹150\n3. Royal Haircut + Beard Combo - ₹350\n4. Facial & Massage Spa - ₹499";
    }

    const replyText = 
`Which service would you like to book? ✂️

${serviceList}

Reply with service name or number!`;

    return { replyText, nextMemory: memory };
  }

  // STEP B: BARBER SELECTION
  if (!draft.barber) {
    memory.currentStep = "SELECT_BARBER";
    await saveConversationMemory(memory);

    const { data: barbers } = await supabaseAdmin
      .from("barbers")
      .select("id, name, experience_years, rating")
      .eq("status", "active")
      .limit(5);

    let barberList = "";
    if (barbers && barbers.length > 0) {
      barberList = barbers.map((b, idx) => `${idx + 1}. ${b.name} (${b.rating}⭐)`).join("\n");
    } else {
      barberList = "1. Rahul (Senior Stylist)\n2. Sameer (Beard Expert)\n3. Amit (Top Rated)";
    }

    // CRM Favourite Barber Recommendation
    let favNote = "";
    if (memory.customerProfile.favourite_barber_name) {
      favNote = `\n💡 Last time you booked with ${memory.customerProfile.favourite_barber_name}!`;
    }

    const replyText = 
`Great choice! Which Barber would you like? 💈${favNote}

${barberList}
4. Anyone Available (First Open Slot)

Reply with Barber Name or 'Anyone'!`;

    return { replyText, nextMemory: memory };
  }

  // STEP C: DATE & TIME SELECTION
  if (!draft.date || !draft.time) {
    memory.currentStep = "SELECT_DATE_TIME";
    await saveConversationMemory(memory);

    const replyText = 
`Awesome! What date and time works for you? 📅

Selected Service: ${draft.service}
Selected Barber: ${draft.barber}

Please reply with preferred Date & Time (e.g. 'Tomorrow 4 PM' or 'Today 6 PM')!`;

    return { replyText, nextMemory: memory };
  }

  // STEP D: FINAL CONFIRMATION
  memory.currentStep = "CONFIRM_BOOKING";
  await saveConversationMemory(memory);

  if (nlu.entities.confirmationAction === "yes" || userMessage.trim().toLowerCase() === "yes" || userMessage.trim().toLowerCase() === "confirm") {
    // Execute Real Database Booking Creation
    const { data: salon } = await supabaseAdmin.from("salons").select("id").limit(1).maybeSingle();
    const { data: barber } = await supabaseAdmin.from("barbers").select("id").eq("name", draft.barber).maybeSingle();
    const { data: service } = await supabaseAdmin.from("services").select("id, price").eq("name", draft.service).maybeSingle();

    const bookingRes = await createSalonBooking({
      salonId: salon?.id,
      customerName: memory.customerProfile.name || "WhatsApp Client",
      customerPhone: memory.fromNumber,
      whatsappNumber: memory.fromNumber,
      barberId: barber?.id || "22222222-2222-2222-2222-222222222222",
      serviceId: service?.id || "33333333-3333-3333-3333-333333333333",
      bookingDate: draft.date || new Date().toISOString().split("T")[0],
      startTime: draft.time || "16:00",
      source: "whatsapp",
    });

    memory.activeFlow = "WELCOME";
    memory.currentStep = "MAIN_MENU";
    memory.draftBooking = {};
    await saveConversationMemory(memory);

    let replyText = "";
    if (bookingRes.success && bookingRes.booking) {
      replyText = 
`🎉 Booking Confirmed!

Booking Code: ${bookingRes.booking.booking_code}
Service: ${draft.service}
Barber: ${draft.barber}
Date: ${bookingRes.booking.booking_date}
Time: ${bookingRes.booking.start_time}

We look forward to seeing you at Velvety Salon! ✨`;
    } else {
      replyText = bookingRes.error || "Booking slot conflict. Please try another time!";
    }

    return { replyText, nextMemory: memory, flowCompleted: true };
  }

  // Ask Final Confirmation
  const summaryText = 
`Please confirm your booking details 📋

✂️ Service: ${draft.service}
💈 Barber: ${draft.barber}
📅 Date: ${draft.date}
⏰ Time: ${draft.time}

Reply 'Yes' to Confirm or 'Cancel' to start over!`;

  return { replyText: summaryText, nextMemory: memory };
}

/**
 * Handle Unrecognized Input or Fallback Guidance
 */
async function handleFallbackResponse(
  memory: ConversationMemory,
  userMessage: string
): Promise<StateMachineResponse> {
  const step = memory.currentStep;

  let guidanceText = "";
  if (step === "SELECT_SERVICE") {
    guidanceText = "I didn't quite understand that. Please select a service for your appointment:\n\n1. Haircut - ₹250\n2. Beard Trim - ₹150\n3. Royal Combo - ₹350";
  } else if (step === "SELECT_BARBER") {
    guidanceText = `You're currently choosing a barber for ${memory.draftBooking.service || "your appointment"}.\n\nPlease choose:\n1. Rahul\n2. Sameer\n3. Anyone Available`;
  } else if (step === "SELECT_DATE_TIME") {
    guidanceText = `Please tell us what Date & Time works for you (e.g. 'Tomorrow 4 PM' or 'Today 6 PM')!`;
  } else {
    guidanceText = `Namaste! How can I help you today?\n1️⃣ Book Appointment\n2️⃣ View Services\n3️⃣ Today's Offers\n4️⃣ Talk to Support`;
  }

  return { replyText: guidanceText, nextMemory: memory };
}
