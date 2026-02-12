import type { OpenAIChatMessage, ChatModelId } from "@chatbot/shared";

const LLM_API_BASE_URL = process.env.LLM_API_BASE_URL || "http://localhost:8000";
const LLM_API_KEY = process.env.LLM_API_KEY || "";

interface LLMStreamOptions {
  model: ChatModelId;
  messages: OpenAIChatMessage[];
  signal?: AbortSignal;
}

/**
 * LLM API에 스트리밍 요청을 보내고 Response를 반환.
 * OpenAI-compatible /v1/chat/completions 엔드포인트 사용.
 */
export async function createLLMStream({
  model,
  messages,
  signal,
}: LLMStreamOptions): Promise<Response> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (LLM_API_KEY) {
    headers["Authorization"] = `Bearer ${LLM_API_KEY}`;
  }

  const response = await fetch(`${LLM_API_BASE_URL}/v1/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      messages,
      stream: true,
    }),
    signal,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error(
      `LLM API error (${response.status}): ${errorText}`,
    );
  }

  return response;
}
