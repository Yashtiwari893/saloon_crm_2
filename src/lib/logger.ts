/**
 * Centralized Production Logger for WhatsApp SaaS & Webhook Pipeline
 */

export interface LogContext {
  timestamp: string;
  step: string;
  correlationId?: string;
  phoneNumber?: string;
  messageId?: string;
  details?: any;
  error?: any;
}

export function logHeader(title: string) {
  const line = "=".repeat(60);
  console.log(`\n${line}`);
  console.log(`  [WHATSAPP BOT LOG] ${title} - ${new Date().toISOString()}`);
  console.log(`${line}`);
}

export function logStep(step: string, data?: any) {
  console.log(`\n[STEP: ${step}] [${new Date().toISOString()}]`);
  if (data !== undefined) {
    if (typeof data === "object") {
      try {
        console.log(JSON.stringify(data, null, 2));
      } catch (e) {
        console.log(data);
      }
    } else {
      console.log(data);
    }
  }
}

export function logWebhookIncoming(method: string, url: string, headers: Record<string, string>, body: any) {
  logHeader("INCOMING WEBHOOK REQUEST");
  console.log(`URL: ${method} ${url}`);
  console.log("Headers:", JSON.stringify(headers, null, 2));
  console.log("Payload Body:");
  try {
    console.log(JSON.stringify(body, null, 2));
  } catch (e) {
    console.log(body);
  }
}

export function logAiGeneration(model: string, promptSummary: string, response: string, durationMs: number) {
  console.log(`\n[AI ENGINE: ${model}] Finished in ${durationMs}ms`);
  console.log(`Prompt Context Summary: ${promptSummary.substring(0, 150)}...`);
  console.log(`Generated Response: "${response}"`);
}

export function logWhatsAppSend(toPhone: string, text: string, status: number, responseData: any) {
  console.log(`\n[WHATSAPP SEND API (11za)] Status Code: ${status}`);
  console.log(`To Phone: ${toPhone}`);
  console.log(`Message Body: "${text}"`);
  console.log(`11za API Response:`, JSON.stringify(responseData, null, 2));
}

export function logError(context: string, error: any) {
  const errLine = "!".repeat(60);
  console.error(`\n${errLine}`);
  console.error(`  [ERROR IN ${context.toUpperCase()}] - ${new Date().toISOString()}`);
  if (error instanceof Error) {
    console.error(`Message: ${error.message}`);
    console.error(`Stack: ${error.stack}`);
  } else {
    console.error("Details:", JSON.stringify(error, null, 2));
  }
  console.error(`${errLine}\n`);
}
