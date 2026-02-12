"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import InputArea from "./InputArea.client";

const SUGGESTIONS = [
  "비트코인 시세 분석해줘",
  "이더리움이란 무엇인가요?",
  "포트폴리오 추천해줘",
  "최근 코인 시장 동향",
];

function NewChatInput() {
  const router = useRouter();

  const handleSubmit = useCallback(
    (message: string, images?: File[]) => {
      void images; // VL 모델 이미지 첨부 시 전달용
      const streamId = crypto.randomUUID();
      router.push(`/chat/${streamId}`);
    },
    [router],
  );

  return (
    <div className="flex flex-col gap-5 w-full items-center">
      <InputArea
        placeholder="무엇이든 물어보세요..."
        onSubmit={handleSubmit}
      />
      <div className="flex flex-wrap gap-2 justify-center">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => handleSubmit(suggestion)}
            className="px-4 py-2 text-sm rounded-full border border-gray-200 hover:border-gray-400 hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition-all cursor-pointer"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}

export default NewChatInput;
