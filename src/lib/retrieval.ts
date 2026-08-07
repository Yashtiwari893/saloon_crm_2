import { supabase } from "@/lib/supabaseClient";

type ChunkRow = {
  id: string;
  chunk: string;
  embedding: number[] | null;
};

type PhoneMatchRow = {
  id: string;
  chunk: string;
  similarity: number;
};

function cosineSimilarity(a: number[], b: number[]) {
  if (a.length !== b.length || a.length === 0) return -1;

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  if (denom === 0) return -1;
  return dot / denom;
}

export async function retrieveRelevantChunks(
  queryEmbedding: number[],
  fileId?: string,
  limit = 5,
  userId?: string
) {
  if (fileId) {
    let query = supabase
      .from("rag_chunks")
      .select("id, chunk, embedding")
      .eq("file_id", fileId)
      .limit(300);

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("FILE-SCOPED VECTOR SEARCH ERROR:", error);
      return [];
    }

    const ranked = ((data as ChunkRow[] | null) ?? [])
      .map((row) => {
        const embedding = Array.isArray(row.embedding) ? row.embedding : null;
        return {
          id: row.id,
          chunk: row.chunk,
          similarity: embedding ? cosineSimilarity(queryEmbedding, embedding) : -1,
        };
      })
      .filter((row) => row.similarity > 0)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    return ranked;
  }

  const { data, error } = await supabase.rpc("match_document_chunks_by_phone", {
    query_embedding: queryEmbedding,
    p_phone_number: "default",
    match_count: limit,
  });

  if (error) {
    console.error("VECTOR SEARCH ERROR:", error);
    return [];
  }

  return (data || []) as { id: string; chunk: string; similarity: number }[];
}

export async function retrieveRelevantChunksFromFiles(
  queryEmbedding: number[],
  fileIds: string[],
  limit = 5
) {
  if (fileIds.length === 0) {
    return [];
  }

  if (fileIds.length === 1) {
    return retrieveRelevantChunks(queryEmbedding, fileIds[0], limit);
  }

  const allChunks: { id: string; chunk: string; similarity: number; file_id: string }[] = [];

  for (const fileId of fileIds) {
    const chunks = await retrieveRelevantChunks(queryEmbedding, fileId, limit);
    allChunks.push(...chunks.map((c) => ({ ...c, file_id: fileId })));
  }

  return allChunks
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
}

export async function retrieveRelevantChunksForPhoneNumber(
  queryEmbedding: number[],
  phoneNumber: string,
  limit = 5
) {
  try {
    console.log(`Retrieving chunks for phone number: ${phoneNumber}, limit: ${limit}`);

    const { data: directChunks, error } = await supabase.rpc("match_document_chunks_by_phone", {
      query_embedding: queryEmbedding,
      p_phone_number: phoneNumber,
      match_count: limit,
    });

    if (error) {
      console.warn("RPC match_document_chunks_by_phone warning:", error.message || error);
      return [];
    }

    const phoneChunks = ((directChunks || []) as PhoneMatchRow[]).map((c) => ({
      id: c.id,
      chunk: c.chunk,
      similarity: c.similarity,
    }));

    return phoneChunks;
  } catch (e: any) {
    console.warn("Non-fatal retrieval error:", e?.message || e);
    return [];
  }
}
