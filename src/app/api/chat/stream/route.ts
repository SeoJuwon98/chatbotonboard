import { createOpenAI } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import type { ChatModelId } from "@chatbot/shared";

export const maxDuration = 30;

const LLM_API_BASE_URL =
  process.env.LLM_API_BASE_URL || "http://localhost:8000";
const LLM_API_KEY = process.env.LLM_API_KEY || "EMPTY";

const localAI = createOpenAI({
  baseURL: `${LLM_API_BASE_URL.replace(/\/$/, "")}/v1`,
  apiKey: LLM_API_KEY,
});

const VALID_MODELS: ChatModelId[] = ["vllm-main", "vl-main"];

export async function POST(req: Request) {
  const body = await req.json();
  const messages = body.messages as UIMessage[];
  const modelId = (
    VALID_MODELS.includes(body.modelId as ChatModelId)
      ? body.modelId
      : "vllm-main"
  ) as ChatModelId;

  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: localAI.chat(modelId),
    messages: modelMessages,
  });

  return result.toUIMessageStreamResponse();
}
