import { Router } from "express";
import type { ChatStreamRequest, StreamEvent } from "@chatbot/shared";
import { createLLMStream } from "../services/llm.js";

export const chatStreamRouter = Router();

/**
 * POST /chat/stream — LLM 스트리밍 프록시
 *
 * OpenAI SSE 포맷을 받아서 클라이언트에 StreamEvent로 변환하여 전달.
 * - delta.content → { type: "content_delta", delta: "..." }
 * - delta.reasoning_content → { type: "reasoning_delta", delta: "..." }
 * - [DONE] → { type: "done" }
 * - 에러 → { type: "error", message: "..." }
 */
chatStreamRouter.post("/stream", async (req, res) => {
  const body = req.body as ChatStreamRequest;

  // SSE 헤더 설정
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const sendEvent = (event: StreamEvent) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  };

  // 클라이언트 연결 종료 시 LLM 요청도 중단
  const abortController = new AbortController();
  req.on("close", () => {
    abortController.abort();
  });

  try {
    const llmResponse = await createLLMStream({
      model: body.model,
      messages: body.messages,
      signal: abortController.signal,
    });

    if (!llmResponse.body) {
      sendEvent({ type: "error", message: "LLM 응답 스트림 없음" });
      sendEvent({ type: "done" });
      res.end();
      return;
    }

    const reader = llmResponse.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // SSE 라인 파싱
      const lines = buffer.split("\n");
      // 마지막 줄은 불완전할 수 있으므로 버퍼에 남김
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(":")) continue;

        if (trimmed === "data: [DONE]") {
          sendEvent({ type: "done" });
          continue;
        }

        if (trimmed.startsWith("data: ")) {
          const jsonStr = trimmed.slice(6);
          try {
            const chunk = JSON.parse(jsonStr);
            const delta = chunk.choices?.[0]?.delta;
            if (!delta) continue;

            if (delta.reasoning_content) {
              sendEvent({
                type: "reasoning_delta",
                delta: delta.reasoning_content,
              });
            }
            if (delta.content) {
              sendEvent({ type: "content_delta", delta: delta.content });
            }
          } catch {
            // JSON 파싱 실패 시 무시
          }
        }
      }
    }

    // 버퍼에 남은 데이터 처리
    if (buffer.trim()) {
      const trimmed = buffer.trim();
      if (trimmed === "data: [DONE]") {
        sendEvent({ type: "done" });
      }
    }

    // done 이벤트가 아직 안 보내졌으면 보내기
    sendEvent({ type: "done" });
    res.end();
  } catch (error) {
    if (abortController.signal.aborted) {
      // 클라이언트가 연결을 끊은 경우
      res.end();
      return;
    }

    const message =
      error instanceof Error ? error.message : "스트리밍 중 오류 발생";
    console.error("POST /chat/stream error:", message);
    sendEvent({ type: "error", message });
    sendEvent({ type: "done" });
    res.end();
  }
});
