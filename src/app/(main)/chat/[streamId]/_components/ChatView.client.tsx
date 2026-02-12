"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import InputArea from "../../../_components/InputArea.client";
import ChatMessage from "./ChatMessage";
import type { Message } from "../types";

interface ChatViewProps {
  streamId: string;
  initialMessages: Message[];
}

function ChatView({ streamId, initialMessages }: ChatViewProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleSubmit = useCallback((message: string, images?: File[]) => {
    void images; // VL 모델 이미지 첨부 시 백엔드 연동 후 사용
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: message,
    };
    setMessages((prev) => [...prev, userMessage]);

    // Mock assistant response after a short delay
    setTimeout(() => {
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "현재 UI 프로토타입 모드입니다. 실제 응답은 백엔드 연동 후 제공됩니다.",
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }, 800);
  }, []);

  return (
    <div
      className="flex-1 flex flex-col min-h-0 w-full"
      data-stream-id={streamId}
    >
      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-400"
      >
        <div className="max-w-[768px] mx-auto px-4 py-6 flex flex-col gap-6">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </div>
      </div>

      {/* Input area - pinned at bottom */}
      <div className="shrink-0 py-4 pb-8 px-4 border-t border-gray-100 shadow-[0_-1px_0_0_rgba(0,0,0,0.04)] min-w-0">
        <div className="max-w-[768px] mx-auto min-w-0">
          <InputArea
            placeholder="메시지를 입력하세요..."
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}

export default ChatView;
