import { Mistral } from "@mistralai/mistralai";

export async function embedText(text: string, retries = 1, customKey?: string | null): Promise<number[] | null> {
  try {
    const apiKey = (customKey && customKey.trim().length > 0) 
      ? customKey.trim() 
      : process.env.MISTRAL_API_KEY;

    if (!apiKey || apiKey === "demo-key" || apiKey === "your_mistral_api_key_here") {
      console.warn("[Embeddings] No valid MISTRAL_API_KEY configured. Skipping vector search gracefully.");
      return null;
    }

    const client = new Mistral({ apiKey });
    const response = await client.embeddings.create({
      model: "mistral-embed",
      inputs: [text],
    });

    const embedding = response.data[0]?.embedding;
    if (!embedding || !Array.isArray(embedding)) {
      return null;
    }

    return embedding;
  } catch (error: any) {
    console.warn("[Embeddings Non-Fatal Error] Mistral API failed:", error?.message || error);
    return null;
  }
}

export async function embedBatch(texts: string[], retries = 1, customKey?: string | null): Promise<number[][]> {
  try {
    const apiKey = (customKey && customKey.trim().length > 0) 
      ? customKey.trim() 
      : process.env.MISTRAL_API_KEY;

    if (!apiKey || apiKey === "demo-key" || apiKey === "your_mistral_api_key_here") {
      console.warn("[Embeddings] No valid MISTRAL_API_KEY for batch. Returning empty embeddings.");
      return texts.map(() => []);
    }

    const client = new Mistral({ apiKey });
    const response = await client.embeddings.create({
      model: "mistral-embed",
      inputs: texts,
    });

    if (!response.data || !Array.isArray(response.data)) {
      return texts.map(() => []);
    }

    return response.data.map(d => d.embedding || []);
  } catch (error: any) {
    console.warn("[Embeddings Non-Fatal Error] Mistral Batch API failed:", error?.message || error);
    return texts.map(() => []);
  }
}
