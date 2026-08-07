import { GoogleGenerativeAI } from "@google/generative-ai";
import { logStep, logError } from "./logger";

export interface ExtractedEntities {
  serviceName?: string;
  barberName?: string;
  dateText?: string;
  timeText?: string;
  commandAction?: "menu" | "back" | "cancel" | "help" | "support" | "reset" | "resume_yes" | "resume_no";
  confirmationAction?: "yes" | "no";
}

export interface NluParseResult {
  intent:
    | "START_BOOKING"
    | "SELECT_SERVICE"
    | "SELECT_BARBER"
    | "SELECT_DATE_TIME"
    | "CONFIRM_BOOKING"
    | "VIEW_MY_BOOKINGS"
    | "VIEW_OFFERS"
    | "CANCEL_BOOKING"
    | "GLOBAL_COMMAND"
    | "RESUME_DECISION"
    | "GENERAL_CHAT";
  entities: ExtractedEntities;
  confidence: number;
}

/**
 * Parse incoming WhatsApp message for intent & extracted entities using Gemini Flash & Rule Interceptors
 */
export async function parseUserMessageNlu(
  userMessage: string,
  currentFlow: string,
  currentStep: string,
  apiKey?: string
): Promise<NluParseResult> {
  const clean = userMessage.trim().toLowerCase();

  // Fast Rule-Based Interceptor for Navigation & Menu Options
  if (clean === "hi" || clean === "hello" || clean === "hey" || clean === "menu" || clean === "main menu") {
    return {
      intent: "GLOBAL_COMMAND",
      entities: { commandAction: "menu" },
      confidence: 1.0,
    };
  }

  if (clean === "back") {
    return {
      intent: "GLOBAL_COMMAND",
      entities: { commandAction: "back" },
      confidence: 1.0,
    };
  }

  if (clean === "cancel" || clean === "cancel booking") {
    return {
      intent: "CANCEL_BOOKING",
      entities: { commandAction: "cancel" },
      confidence: 1.0,
    };
  }

  if (clean.startsWith("4") || clean.includes("support") || clean.includes("talk to support") || clean.includes("help")) {
    return {
      intent: "GLOBAL_COMMAND",
      entities: { commandAction: "support" },
      confidence: 1.0,
    };
  }

  if (clean === "yes" || clean === "haan" || clean === "continue" || clean === "y") {
    return {
      intent: "RESUME_DECISION",
      entities: { commandAction: "resume_yes", confirmationAction: "yes" },
      confidence: 0.95,
    };
  }

  if (clean === "no" || clean === "nahi" || clean === "start again" || clean === "n") {
    return {
      intent: "RESUME_DECISION",
      entities: { commandAction: "resume_no", confirmationAction: "no" },
      confidence: 0.95,
    };
  }

  // OPTION 1: Book Appointment
  if (clean.startsWith("1") || clean.includes("book appointment") || clean === "book") {
    return {
      intent: "START_BOOKING",
      entities: {},
      confidence: 0.95,
    };
  }

  // OPTION 2: View Services Catalog
  if (clean.startsWith("2") || clean.includes("service") || clean.includes("services") || clean.includes("catalog")) {
    return {
      intent: "SELECT_SERVICE",
      entities: {},
      confidence: 0.95,
    };
  }

  // OPTION 3: Today's Special Offers
  if (clean.startsWith("3") || clean.includes("offer") || clean.includes("discount") || clean.includes("deals")) {
    return {
      intent: "VIEW_OFFERS",
      entities: {},
      confidence: 0.95,
    };
  }

  // OPTION 5: My Booking
  if (clean.startsWith("5") || clean.includes("my booking") || clean.includes("meri booking")) {
    return {
      intent: "VIEW_MY_BOOKINGS",
      entities: {},
      confidence: 0.95,
    };
  }

  // LLM NLU Entity Extractor via Gemini AI for Natural Text Queries
  const geminiKey = apiKey || process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    return { intent: "GENERAL_CHAT", entities: {}, confidence: 0.5 };
  }

  try {
    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const systemPrompt = `You are a NLU Entity Extractor for a Salon WhatsApp Bot.
Extract intent and entities from the user message.
Current Active Flow: ${currentFlow}, Current Step: ${currentStep}.

Return strictly JSON format:
{
  "intent": "START_BOOKING" | "SELECT_SERVICE" | "SELECT_BARBER" | "SELECT_DATE_TIME" | "CONFIRM_BOOKING" | "VIEW_MY_BOOKINGS" | "VIEW_OFFERS" | "CANCEL_BOOKING" | "GLOBAL_COMMAND" | "GENERAL_CHAT",
  "entities": {
    "serviceName": string or null,
    "barberName": string or null,
    "dateText": string or null,
    "timeText": string or null,
    "commandAction": "menu" | "back" | "cancel" | "help" | "support" | "reset" | null,
    "confirmationAction": "yes" | "no" | null
  }
}`;

    const prompt = `User Message: "${userMessage}"`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      systemInstruction: systemPrompt,
    });

    const rawText = result.response.text();
    const cleanJson = rawText.replace(/```json/gi, "").replace(/```/gi, "").trim();
    const parsed = JSON.parse(cleanJson);

    logStep("NLU_EXTRACTED_RESULT", parsed);

    return {
      intent: parsed.intent || "GENERAL_CHAT",
      entities: parsed.entities || {},
      confidence: 0.9,
    };
  } catch (err) {
    logError("NLU Gemini Extraction Exception", err);
    return {
      intent: "GENERAL_CHAT",
      entities: {},
      confidence: 0.5,
    };
  }
}
