import { createOpenAI } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
// @chatbot/shared 경로는 실제 프로젝트 경로에 맞게 수정해주세요
import type { ChatModelId } from "@chatbot/shared";

export const maxDuration = 60; // 추론 모델은 시간이 더 걸릴 수 있으므로 늘림

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

  // 클라이언트에서 보낸 modelId 사용
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

  return result.toUIMessageStreamResponse({
    // 중요: 추론 과정(Reasoning) 토큰을 클라이언트로 전송 허용
    sendReasoning: true,
  });
}
