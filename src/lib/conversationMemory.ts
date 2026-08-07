import { supabaseAdmin } from "./supabaseAdmin";
import { logStep, logError } from "./logger";

export interface DraftBooking {
  branch?: string;
  service?: string;
  serviceId?: string;
  barber?: string;
  barberId?: string;
  date?: string;
  time?: string;
  price?: number;
  durationMinutes?: number;
  [key: string]: any;
}

export interface CustomerProfile {
  id?: string;
  name?: string;
  phone_number?: string;
  whatsapp_number?: string;
  loyalty_points?: number;
  total_visits?: number;
  total_spend?: number;
  favourite_barber_id?: string;
  favourite_barber_name?: string;
  is_vip?: boolean;
}

export interface ConversationMemory {
  id?: string;
  fromNumber: string;
  toNumber: string;
  conversationId: string;
  activeFlow: string;
  currentStep: string;
  previousStep?: string;
  draftBooking: DraftBooking;
  customerProfile: CustomerProfile;
  lastUserMessage?: string;
  lastBotMessage?: string;
  flowStatus: "active" | "paused" | "completed" | "cancelled";
  lastInteractionAt: string;
  updatedAt?: string;
}

/**
 * Load or create persistent conversation memory & CRM context for a WhatsApp customer
 */
export async function loadConversationMemory(
  fromNumber: string,
  toNumber: string,
  senderName?: string
): Promise<ConversationMemory> {
  try {
    logStep("LOADING_CONVERSATION_MEMORY", { fromNumber, toNumber, senderName });

    // 1. Fetch CRM Customer Record
    let customer: CustomerProfile = {};
    const { data: customerData } = await supabaseAdmin
      .from("customers")
      .select("id, name, phone_number, whatsapp_number, loyalty_points, total_visits, total_spend, favourite_barber_id, is_vip, barbers(name)")
      .eq("whatsapp_number", fromNumber)
      .maybeSingle();

    if (customerData) {
      const barbersData: any = (customerData as any).barbers;
      const barberName = Array.isArray(barbersData)
        ? barbersData[0]?.name
        : barbersData?.name;

      customer = {
        id: customerData.id,
        name: customerData.name || senderName || "Guest",
        phone_number: customerData.phone_number,
        whatsapp_number: customerData.whatsapp_number,
        loyalty_points: customerData.loyalty_points || 0,
        total_visits: customerData.total_visits || 0,
        total_spend: customerData.total_spend || 0,
        favourite_barber_id: customerData.favourite_barber_id,
        favourite_barber_name: barberName,
        is_vip: customerData.is_vip || false,
      };
    } else if (senderName) {
      customer = { name: senderName, whatsapp_number: fromNumber };
    }

    // 2. Fetch Conversation Memory Record
    const { data: memData } = await supabaseAdmin
      .from("user_conversation_data")
      .select("*")
      .eq("from_number", fromNumber)
      .eq("to_number", toNumber)
      .maybeSingle();

    if (memData) {
      const memory: ConversationMemory = {
        id: memData.id,
        fromNumber: memData.from_number,
        toNumber: memData.to_number,
        conversationId: memData.conversation_id || `conv_${Date.now()}`,
        activeFlow: memData.active_flow || "WELCOME",
        currentStep: memData.current_step || "MAIN_MENU",
        previousStep: memData.previous_step || undefined,
        draftBooking: memData.draft_booking || {},
        customerProfile: customer,
        lastUserMessage: memData.last_user_message || undefined,
        lastBotMessage: memData.last_bot_message || undefined,
        flowStatus: memData.flow_status || "active",
        lastInteractionAt: memData.last_interaction_at || memData.updated_at || new Date().toISOString(),
      };

      logStep("CONVERSATION_MEMORY_LOADED", {
        conversationId: memory.conversationId,
        activeFlow: memory.activeFlow,
        currentStep: memory.currentStep,
        draftBooking: memory.draftBooking,
        customerName: memory.customerProfile.name,
      });

      return memory;
    }

    // Initialize Default Memory for New Conversations
    const newMemory: ConversationMemory = {
      fromNumber,
      toNumber,
      conversationId: `conv_${Date.now()}`,
      activeFlow: "WELCOME",
      currentStep: "MAIN_MENU",
      draftBooking: {},
      customerProfile: customer,
      flowStatus: "active",
      lastInteractionAt: new Date().toISOString(),
    };

    // Save initial record to DB
    await saveConversationMemory(newMemory);

    return newMemory;
  } catch (err) {
    logError("loadConversationMemory Exception", err);
    return {
      fromNumber,
      toNumber,
      conversationId: `conv_${Date.now()}`,
      activeFlow: "WELCOME",
      currentStep: "MAIN_MENU",
      draftBooking: {},
      customerProfile: { name: senderName || "Guest" },
      flowStatus: "active",
      lastInteractionAt: new Date().toISOString(),
    };
  }
}

/**
 * Save updated conversation memory and booking draft to Supabase
 */
export async function saveConversationMemory(memory: ConversationMemory): Promise<boolean> {
  try {
    logStep("SAVING_CONVERSATION_MEMORY", {
      fromNumber: memory.fromNumber,
      activeFlow: memory.activeFlow,
      currentStep: memory.currentStep,
      draftBooking: memory.draftBooking,
    });

    const record = {
      from_number: memory.fromNumber,
      to_number: memory.toNumber,
      conversation_id: memory.conversationId,
      active_flow: memory.activeFlow,
      current_step: memory.currentStep,
      previous_step: memory.previousStep || null,
      draft_booking: memory.draftBooking || {},
      last_user_message: memory.lastUserMessage || null,
      last_bot_message: memory.lastBotMessage || null,
      flow_status: memory.flowStatus || "active",
      last_interaction_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabaseAdmin
      .from("user_conversation_data")
      .upsert(record, { onConflict: "from_number,to_number" });

    if (error) {
      logError("saveConversationMemory Upsert Error", error);
      return false;
    }
    return true;
  } catch (err) {
    logError("saveConversationMemory Exception", err);
    return false;
  }
}

/**
 * Clear current active flow and booking draft
 */
export async function resetConversationMemory(fromNumber: string, toNumber: string): Promise<boolean> {
  try {
    logStep("RESETTING_CONVERSATION_MEMORY", { fromNumber });
    const { error } = await supabaseAdmin
      .from("user_conversation_data")
      .update({
        active_flow: "WELCOME",
        current_step: "MAIN_MENU",
        previous_step: null,
        draft_booking: {},
        flow_status: "active",
        updated_at: new Date().toISOString(),
      })
      .eq("from_number", fromNumber)
      .eq("to_number", toNumber);

    if (error) {
      logError("resetConversationMemory Error", error);
      return false;
    }
    return true;
  } catch (err) {
    logError("resetConversationMemory Exception", err);
    return false;
  }
}
