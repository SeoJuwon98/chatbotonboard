"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { AlertCircle, RefreshCw } from "lucide-react"; // 아이콘 예시
import InputArea from "../../../_components/InputArea.client";
import ChatMessage from "./ChatMessage";
import type { Message, ChatModelId } from "../types";
// ChatModelId 등은 실제 타입 정의 경로에서 가져오세요.

interface ChatViewProps {
  streamId: string;
  initialMessages: Message[];
}

export default function ChatView({ streamId, initialMessages }: ChatViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [model, setModel] = useState<ChatModelId>("vllm-main");

  const {
    messages,
    sendMessage,
    status,
    stop,
    error,
    reload, // 에러 발생 시 재시도용
  } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat/stream",
    }),
    // 1. 쓰로틀링: 50ms마다 UI 업데이트 (성능 최적화)
    experimental_throttle: 50,
    // 2. 선택된 모델 정보를 API로 전달 (동적 바디)
    body: {
      modelId: model,
    },
    onError: (err) => {
      console.error("Chat error:", err);
    },
  });

  const isLoading = status === "submitted" || status === "streaming";

  // 자동 스크롤
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleSendMessage = useCallback(
    async (text: string, images?: File[]) => {
      if (!text.trim() && (!images || images.length === 0)) return;

      // AI SDK 4.x 방식: files 옵션 사용
      // useChat이 자동으로 File 객체를 base64/url로 변환하여 처리함
      await sendMessage({
        text: text,
        // 이미지가 있을 경우만 files 필드 추가
        files: images && images.length > 0 ? images : undefined,
      });
    },
    [sendMessage],
  );

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full relative">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full"
      >
        <div className="max-w-[768px] mx-auto flex flex-col gap-6 py-6">
          {messages.map((m: UIMessage) => (
            <ChatMessage key={m.id} message={m} />
          ))}

          {/* 3. 에러 상태 UI */}
          {error && (
            <div className="flex items-center justify-between p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>
                  오류가 발생했습니다: {error.message || "알 수 없는 오류"}
                </span>
              </div>
              <button
                onClick={() => reload()}
                className="flex items-center gap-1 px-3 py-1.5 bg-white border border-red-200 rounded-md hover:bg-red-50 text-xs font-medium shadow-sm"
              >
                <RefreshCw className="w-3 h-3" />
                재시도
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0 py-4 pb-8 px-4 border-t border-gray-100 min-w-0 bg-white">
        <div className="max-w-[768px] mx-auto">
          <InputArea
            onSubmit={handleSendMessage}
            disabled={status === "submitted"} // 전송 중에는 입력만 막고, 스트리밍 중에는 Stop 가능하게
            isStreaming={isLoading}
            onStop={stop} // 4. 생성 취소 연결
            model={model}
            onModelChange={setModel}
          />
        </div>
      </div>
    </div>
  );
}
