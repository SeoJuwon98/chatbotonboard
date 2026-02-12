"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import InputArea from "./InputArea.client";
import { sessionsApi, messagesApi } from "@/lib/api";
import { useChatStreamStore } from "../_stores/chat-stream";
import type { ImageAttachment } from "@chatbot/shared";

const SUGGESTIONS = [
  "비트코인 시세 분석해줘",
  "이더리움이란 무엇인가요?",
  "포트폴리오 추천해줘",
  "최근 코인 시장 동향",
];

function NewChatInput() {
  const router = useRouter();
  const { model, setModel } = useChatStreamStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (message: string, imageFiles?: File[]) => {
      if (isSubmitting) return;
      setIsSubmitting(true);

      try {
        // 이미지를 base64로 변환
        let images: ImageAttachment[] | undefined;
        if (imageFiles && imageFiles.length > 0) {
          images = await Promise.all(
            imageFiles.map(async (file) => {
              const buffer = await file.arrayBuffer();
              const base64 = btoa(
                new Uint8Array(buffer).reduce(
                  (data, byte) => data + String.fromCharCode(byte),
                  "",
                ),
              );
              return { base64, mimeType: file.type };
            }),
          );
        }

        // 1. 세션 생성
        const streamId = crypto.randomUUID();
        await sessionsApi.create({
          id: streamId,
          model,
        });

        // 2. user 메시지 저장
        await messagesApi.create(streamId, {
          role: "user",
          content: message,
          images: images ?? null,
        });

        // 3. 채팅 페이지로 이동 (ChatView에서 자동으로 스트리밍 시작)
        router.push(`/chat/${streamId}`);
      } catch (error) {
        console.error("새 채팅 생성 실패:", error);
        setIsSubmitting(false);
      }
    },
    [model, router, isSubmitting],
  );

  const handleSuggestion = useCallback(
    (suggestion: string) => {
      handleSubmit(suggestion);
    },
    [handleSubmit],
  );

  return (
    <div className="flex flex-col gap-5 w-full items-center">
      <InputArea
        placeholder="무엇이든 물어보세요..."
        onSubmit={handleSubmit}
        disabled={isSubmitting}
        model={model}
        onModelChange={setModel}
      />
      <div className="flex flex-wrap gap-2 justify-center">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => handleSuggestion(suggestion)}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm rounded-full border border-gray-200 hover:border-gray-400 hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}

export default NewChatInput;
