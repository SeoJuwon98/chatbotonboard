import { Router } from "express";
import { createLLMStream } from "../services/llm.js";
export const v1ChatRouter = Router();
/**
 * POST /v1/chat/completions — OpenAI 호환 스트리밍 채팅
 *
 * 요청: OpenAI API와 동일 (model, messages, stream: true)
 * 응답: SSE로 OpenAI 스트리밍 형식 전달 (chat.completion.chunk)
 */
v1ChatRouter.post("/chat/completions", async (req, res) => {
    const body = req.body;
    const model = body.model || "GPT-OSS-120B";
    const messages = body.messages ?? [];
    const stream = body.stream !== false;
    if (!stream) {
        res.status(501).json({
            error: {
                message: "Non-streaming (stream: false) is not supported",
                type: "invalid_request_error",
            },
        });
        return;
    }
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();
    const abortController = new AbortController();
    req.on("close", () => abortController.abort());
    try {
        const streamIter = await createLLMStream({
            model,
            messages,
            signal: abortController.signal,
        });
        for await (const chunk of streamIter) {
            res.write(`data: ${JSON.stringify(chunk)}\n\n`);
        }
        res.end();
    }
    catch (error) {
        if (abortController.signal.aborted) {
            res.end();
            return;
        }
        const message = error instanceof Error ? error.message : "스트리밍 중 오류 발생";
        console.error("POST /v1/chat/completions error:", message);
        const errorPayload = {
            error: { message, type: "server_error" },
        };
        res.write(`data: ${JSON.stringify(errorPayload)}\n\n`);
        res.end();
    }
});
//# sourceMappingURL=v1-chat.js.map