"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useRouter } from "next/navigation";
import InputArea from "../../../_components/InputArea.client";
import ChatMessage from "./ChatMessage";
import ChatError from "./ChatError.client";
import { messagesApi } from "@/lib/api";
import type { Message, ChatModelId } from "../types";
import {
  messagesToUIMessages,
  uiMessageToDisplay,
} from "../_lib/message-utils";

interface ChatViewProps {
  streamId: string;
  initialMessages: Message[];
}

export default function ChatView({ streamId, initialMessages }: ChatViewProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [model, setModel] = useState<ChatModelId>("vllm-main");

  const { messages, sendMessage, status, stop, regenerate, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat/stream",
      body: { modelId: model, streamId },
    }),
    initialMessages: messagesToUIMessages(initialMessages),
    onFinish: async ({
      message,
      isAbort,
    }: {
      message: UIMessage;
      isAbort: boolean;
    }) => {
      if (!isAbort && message.role === "assistant") {
        const display = uiMessageToDisplay(message);
        if (display.content) {
          await messagesApi.create(streamId, {
            role: "assistant",
            content: display.content,
            reasoningContent: display.reasoningContent ?? null,
          });
        }
      }
      router.refresh();
    },
    onError: (err: Error) => {
      console.error("Chat Error:", err);
    },
  });

  // 자동 스크롤
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const onCustomSubmit = useCallback(
    async (text: string, imageFiles?: File[]) => {
      // TODO: imageFiles 지원 시 sendMessage에 files 전달
      void imageFiles;
      await messagesApi.create(streamId, {
        role: "user",
        content: text,
      });
      router.refresh();
      await sendMessage({ text });
    },
    [sendMessage, streamId, router],
  );

  // 초기 진입 시 자동 시작 (마지막 메시지가 user일 경우)
  const initRef = useRef(false);
  useEffect(() => {
    if (initRef.current || messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role === "user") {
      initRef.current = true;
      regenerate();
    }
  }, [messages, regenerate]);

  const isLoading = status === "submitted" || status === "streaming";

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full"
      >
        <div className="max-w-[768px] mx-auto flex flex-col gap-6 py-6">
          {messages.map((m: UIMessage) => (
            <ChatMessage key={m.id} message={uiMessageToDisplay(m)} />
          ))}

          {error && (
            <ChatError message={error.message} onRetry={() => regenerate()} />
          )}
        </div>
      </div>

      <div className="shrink-0 py-4 pb-8 px-4 border-t border-gray-100 min-w-0">
        <div className="max-w-[768px] mx-auto">
          <InputArea
            placeholder="메시지를 입력하세요..."
            onSubmit={onCustomSubmit}
            disabled={isLoading}
            isStreaming={isLoading}
            onStop={stop}
            model={model}
            onModelChange={setModel}
          />
        </div>
      </div>
    </div>
  );
}
