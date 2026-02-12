import OpenAI from "openai";
import type { OpenAIChatMessage, ChatModelId } from "@chatbot/shared";

const LLM_API_BASE_URL =
  process.env.LLM_API_BASE_URL || "http://localhost:8000";
const LLM_API_KEY = process.env.LLM_API_KEY || "";

const openai = new OpenAI({
  baseURL: `${LLM_API_BASE_URL.replace(/\/$/, "")}/v1`,
  apiKey: LLM_API_KEY || "dummy",
});

interface LLMStreamOptions {
  model: ChatModelId;
  messages: OpenAIChatMessage[];
  signal?: AbortSignal;
}

/**
 * OpenAI 호환(Compatible) API를 사용해 스트리밍 요청.
 * 공식 openai SDK로 baseURL 지정 시 vLLM, Ollama 등 호환 서버 사용 가능.
 */
export async function createLLMStream({
  model,
  messages,
  signal,
}: LLMStreamOptions) {
  const stream = await openai.chat.completions.create(
    {
      model,
      messages: messages as OpenAI.ChatCompletionMessageParam[],
      stream: true,
    },
    { signal },
  );
  return stream;
}
