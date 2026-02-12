"use client";

import { useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import InputArea from "../../../_components/InputArea.client";
import ChatMessage from "./ChatMessage";
import StreamingMessage from "./StreamingMessage.client";
import ChatError from "./ChatError.client";
import type { Message, ChatModelId } from "../types";
import { useChatStreamStore } from "../../../_stores/chat-stream";
import { messagesApi, chatStreamApi } from "@/lib/api";
import type {
  OpenAIChatMessage,
  ImageAttachment,
} from "@chatbot/shared";

interface ChatViewProps {
  streamId: string;
  initialMessages: Message[];
}

function ChatView({ streamId, initialMessages }: ChatViewProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    isStreaming,
    streamingStreamId,
    partialContent,
    reasoningContent,
    error,
    model,
    startStream,
    handleEvent,
    completeStream,
    stopStream,
    setError,
    reset,
    setModel,
  } = useChatStreamStore();

  // 현재 스트림에 해당하는 스트리밍인지 확인
  const isCurrentStream = streamingStreamId === streamId && isStreaming;

  // 메시지는 서버에서 받은 initialMessages 사용 (페이지 진입 시 SSR fetch)
  // 새 메시지 추가 후에는 router.refresh()로 서버 데이터 다시 가져옴
  const messages = initialMessages;

  // 자동 스크롤
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, partialContent, reasoningContent]);

  // 스트리밍 시작 로직
  const startChatStream = useCallback(
    async (
      allMessages: OpenAIChatMessage[],
    ) => {
      const controller = startStream(streamId);

      try {
        await chatStreamApi.stream(
          { model, messages: allMessages },
          {
            signal: controller.signal,
            onEvent: (event) => {
              handleEvent(event);
              if (event.type === "done") {
                // completeStream은 아래 finally/then에서 처리
              }
            },
          },
        );

        // 스트리밍 완료 — assistant 메시지 DB 저장
        const result = completeStream();
        if (result.content) {
          await messagesApi.create(streamId, {
            role: "assistant",
            content: result.content,
            reasoningContent: result.reasoningContent,
          });
        }
        router.refresh();
      } catch (err) {
        if (controller.signal.aborted) {
          // 사용자가 중지한 경우 — 현재까지 내용 저장
          const result = completeStream();
          if (result.content) {
            await messagesApi.create(streamId, {
              role: "assistant",
              content: result.content + "\n\n_(응답이 중단되었습니다)_",
              reasoningContent: result.reasoningContent,
            });
          }
          router.refresh();
          return;
        }
        const message =
          err instanceof Error ? err.message : "스트리밍 중 오류 발생";
        setError(message);
      }
    },
    [streamId, model, startStream, handleEvent, completeStream, setError, router],
  );

  // 첫 진입 시: 마지막 메시지가 user면 자동으로 스트리밍 시작 (NewChatInput에서 넘어온 경우)
  const hasAutoStartedRef = useRef(false);
  useEffect(() => {
    hasAutoStartedRef.current = false;
  }, [streamId]);
  useEffect(() => {
    if (
      messages.length === 0 ||
      messages[messages.length - 1].role !== "user" ||
      isStreaming ||
      hasAutoStartedRef.current
    )
      return;
    hasAutoStartedRef.current = true;
    const openaiMessages: OpenAIChatMessage[] = messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));
    startChatStream(openaiMessages);
  }, [messages, isStreaming, startChatStream, streamId]);

  // 메시지 전송
  const handleSubmit = useCallback(
    async (text: string, imageFiles?: File[]) => {
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

      // 1. user 메시지 즉시 DB 저장
      await messagesApi.create(streamId, {
        role: "user",
        content: text,
        images: images ?? null,
      });
      router.refresh();

      // 2. OpenAI 포맷 메시지 배열 구성
      const openaiMessages: OpenAIChatMessage[] = [
        ...messages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ];

      // 현재 메시지 추가 (이미지 포함 시 멀티파트 포맷)
      if (images && images.length > 0) {
        openaiMessages.push({
          role: "user",
          content: [
            { type: "text", text },
            ...images.map((img) => ({
              type: "image_url" as const,
              image_url: {
                url: `data:${img.mimeType};base64,${img.base64}`,
              },
            })),
          ],
        });
      } else {
        openaiMessages.push({ role: "user", content: text });
      }

      // 3. 스트리밍 시작
      await startChatStream(openaiMessages);
    },
    [streamId, messages, startChatStream, router],
  );

  // 재시도
  const handleRetry = useCallback(() => {
    reset();
    // 마지막 user 메시지를 찾아서 다시 전송
    const lastUserMsg = [...messages]
      .reverse()
      .find((m) => m.role === "user");
    if (lastUserMsg) {
      const openaiMessages: OpenAIChatMessage[] = messages
        .filter((m) => m !== lastUserMsg)
        .map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }));
      openaiMessages.push({ role: "user", content: lastUserMsg.content });
      startChatStream(openaiMessages);
    }
  }, [messages, reset, startChatStream]);

  // 중지
  const handleStop = useCallback(() => {
    stopStream();
  }, [stopStream]);

  // 모델 변경
  const handleModelChange = useCallback(
    (m: ChatModelId) => {
      setModel(m);
    },
    [setModel],
  );

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
          {/* 스트리밍 중인 assistant 응답 */}
          {isCurrentStream && (partialContent || reasoningContent) && (
            <StreamingMessage
              content={partialContent}
              reasoningContent={reasoningContent}
              isStreaming={isStreaming}
            />
          )}
          {/* 에러 표시 */}
          {error && !isStreaming && (
            <ChatError message={error} onRetry={handleRetry} />
          )}
        </div>
      </div>

      {/* Input area - pinned at bottom */}
      <div className="shrink-0 py-4 pb-8 px-4 border-t border-gray-100 shadow-[0_-1px_0_0_rgba(0,0,0,0.04)] min-w-0">
        <div className="max-w-[768px] mx-auto min-w-0">
          <InputArea
            placeholder="메시지를 입력하세요..."
            onSubmit={handleSubmit}
            disabled={isCurrentStream}
            isStreaming={isCurrentStream}
            onStop={handleStop}
            model={model}
            onModelChange={handleModelChange}
          />
        </div>
      </div>
    </div>
  );
}

export default ChatView;
