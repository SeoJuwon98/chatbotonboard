"use client";

import { type UIMessage } from "ai";
import { cn } from "@/lib/utils";
import { Bot, User, BrainCircuit } from "lucide-react"; // 아이콘 필요 시 추가
// import ReactMarkdown from "react-markdown"; // 마크다운 렌더링 라이브러리 사용 권장

interface ChatMessageProps {
  message: UIMessage;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex w-full gap-4",
        isUser ? "flex-row-reverse" : "flex-row",
      )}
    >
      {/* 아바타 영역 */}
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-xs",
          isUser ? "bg-black" : "bg-emerald-600",
        )}
      >
        {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </div>

      {/* 메시지 내용 영역 */}
      <div
        className={cn(
          "flex flex-col gap-2 max-w-[85%] text-sm leading-relaxed",
          isUser ? "items-end" : "items-start",
        )}
      >
        {/* 사용자 이름 */}
        <span className="text-gray-500 text-xs font-medium">
          {isUser ? "User" : "AI"}
        </span>

        {/* 메시지 파트 렌더링 */}
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 shadow-sm break-words whitespace-pre-wrap",
            isUser
              ? "bg-black text-white rounded-tr-none"
              : "bg-white border border-gray-100 rounded-tl-none",
          )}
        >
          {message.parts.map((part, index) => {
            // 1. 텍스트 렌더링
            if (part.type === "text") {
              return (
                <div key={index} className="markdown-body">
                  {/* ReactMarkdown 등을 사용하면 더 좋습니다 */}
                  {part.text}
                </div>
              );
            }

            // 2. 추론 과정(Reasoning) 렌더링
            if (part.type === "reasoning") {
              return (
                <details
                  key={index}
                  open
                  className="mb-2 rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900"
                >
                  <summary className="flex cursor-pointer items-center gap-1 font-semibold text-amber-700 select-none">
                    <BrainCircuit className="h-3 w-3" />
                    추론 과정 (Reasoning)
                  </summary>
                  <pre className="mt-2 whitespace-pre-wrap text-xs text-gray-600 font-mono">
                    {part.text}
                  </pre>
                </details>
              );
            }

            // 3. 이미지 렌더링 (사용자가 보낸 이미지)
            if (part.type === "image") {
              // file 타입이나 image 타입으로 들어올 수 있음 (SDK 버전에 따라 다름)
              // 여기서는 이미 변환된 url을 사용
              const imgUrl = "image" in part ? part.image : (part as any).url;

              return (
                <div
                  key={index}
                  className="mt-2 mb-2 rounded-lg overflow-hidden border border-gray-200 max-w-sm"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imgUrl}
                    alt="User uploaded"
                    className="w-full h-auto object-cover"
                  />
                </div>
              );
            }

            return null;
          })}
        </div>
      </div>
    </div>
  );
}
