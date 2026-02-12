import { IRouter, Router } from "express";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

const router: IRouter = Router();

// 1. 로컬 vLLM 연결 설정 (공통)
const localAI = createOpenAI({
  baseURL: process.env.LLM_API_BASE_URL || "http://localhost:8000/v1",
  apiKey: "EMPTY",
});

router.post("/", async (req, res) => {
  try {
    console.log(process.env.LLM_API_BASE_URL);

    // 프론트에서 modelId도 함께 받음 (기본값 설정 가능)
    const { messages, modelId = "vllm-main" } = req.body;

    // 2. 요청된 모델 ID 검증 (보안상 안전장치)
    const validModels = ["vllm-main", "vl-main"];
    const targetModel = validModels.includes(modelId) ? modelId : "vllm-main";

    // 3. 선택된 모델로 스트림 생성
    const result = streamText({
      model: localAI.chat(targetModel), // 동적으로 모델 변경
      messages,
    });

    // 4. 응답 파이핑 (AI SDK 5+에서 pipeDataStreamToResponse → pipeUIMessageStreamToResponse로 변경됨)
    result.pipeUIMessageStreamToResponse(res);
  } catch (error) {
    console.error("Stream Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
