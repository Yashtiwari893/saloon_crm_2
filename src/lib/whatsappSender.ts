import { logWhatsAppSend, logError } from "./logger";

/**
 * Official 11za.in WhatsApp API Endpoint
 */
const WHATSAPP_API_URL = "https://api.11za.in/apis/sendMessage/sendMessages";

export type SendMessageResult = {
  success: boolean;
  error?: string;
  response?: unknown;
};

/**
 * Clean phone number to digits only (e.g., +91 98199 88776 -> 919819988776)
 */
export function formatPhoneNumberFor11za(phone: string): string {
  if (!phone) return "";
  const cleaned = phone.replace(/[^0-9]/g, "");
  // If 10-digit Indian number without country code, prepend 91
  if (cleaned.length === 10) {
    return `91${cleaned}`;
  }
  return cleaned;
}

/**
 * Send a text message via WhatsApp using 11za.in API
 */
export async function sendWhatsAppMessage(
  phoneNumber: string,
  message: string,
  authToken: string,
  originWebsite: string
): Promise<SendMessageResult> {
  const startTime = Date.now();
  try {
    if (!authToken || !originWebsite) {
      logError("WhatsAppSender", new Error("Missing authToken or originWebsite credentials"));
      return {
        success: false,
        error: "WhatsApp API credentials (authToken or originWebsite) missing.",
      };
    }

    const formattedPhone = formatPhoneNumberFor11za(phoneNumber);
    const cleanOrigin = (originWebsite && originWebsite !== "demo-origin" && originWebsite !== "https://your-salon-domain.com") 
      ? originWebsite 
      : (process.env.WHATSAPP_ORIGIN || "https://api.11za.in");

    // Official 11za JSON Payload Format
    const payload = {
      sendto: formattedPhone,
      authToken: authToken,
      originWebsite: cleanOrigin,
      contentType: "text",
      text: message,
    };

    console.log(`[11za API Request] Sending message to ${formattedPhone} via ${WHATSAPP_API_URL}...`);

    const response = await fetch(WHATSAPP_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    let resData: any = {};
    const resText = await response.text();
    try {
      resData = JSON.parse(resText);
    } catch (e) {
      resData = { rawText: resText };
    }

    logWhatsAppSend(formattedPhone, message, response.status, resData);

    if (!response.ok) {
      logError("11za API Non-200 Response", resData);
      return {
        success: false,
        error: `11za API returned HTTP ${response.status}: ${resText}`,
        response: resData,
      };
    }

    return {
      success: true,
      response: resData,
    };
  } catch (error) {
    logError("sendWhatsAppMessage Exception", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown send exception",
    };
  }
}

/**
 * Send a template message via WhatsApp using 11za.in API
 */
export async function sendWhatsAppTemplate(
  phoneNumber: string,
  templateData: {
    templateId: string;
    parameters?: Record<string, string>;
  },
  authToken: string,
  originWebsite: string
): Promise<SendMessageResult> {
  try {
    const formattedPhone = formatPhoneNumberFor11za(phoneNumber);
    const cleanOrigin = (originWebsite && originWebsite !== "demo-origin") ? originWebsite : (process.env.WHATSAPP_ORIGIN || "https://api.11za.in");

    const payload = {
      sendto: formattedPhone,
      authToken: authToken,
      originWebsite: cleanOrigin,
      templateId: templateData.templateId,
      parameters: templateData.parameters || {},
    };

    const response = await fetch("https://api.11za.in/apis/template/sendTemplate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    logWhatsAppSend(formattedPhone, `Template: ${templateData.templateId}`, response.status, data);

    if (!response.ok) {
      return {
        success: false,
        error: `WhatsApp API returned ${response.status}`,
        response: data,
      };
    }

    return {
      success: true,
      response: data,
    };
  } catch (error) {
    logError("sendWhatsAppTemplate Exception", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
