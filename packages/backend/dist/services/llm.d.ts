import OpenAI from "openai";
import type { OpenAIChatMessage, ChatModelId } from "@chatbot/shared";
interface LLMStreamOptions {
    model: ChatModelId;
    messages: OpenAIChatMessage[];
    signal?: AbortSignal;
}
/**
 * OpenAI 호환(Compatible) API를 사용해 스트리밍 요청.
 * 공식 openai SDK로 baseURL 지정 시 vLLM, Ollama 등 호환 서버 사용 가능.
 */
export declare function createLLMStream({ model, messages, signal, }: LLMStreamOptions): Promise<import("openai/streaming.mjs").Stream<OpenAI.Chat.Completions.ChatCompletionChunk> & {
    _request_id?: string | null;
}>;
export {};
