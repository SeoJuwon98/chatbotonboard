"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, BrainCircuit } from "lucide-react";
import type { DisplayMessage } from "../_lib/message-utils";

interface ChatMessageProps {
  message: DisplayMessage;
}

function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const [reasoningOpen, setReasoningOpen] = useState(false);

  return (
    <div
      className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn("max-w-[85%] flex flex-col gap-2", isUser && "items-end")}
      >
        {/* User 메시지에 첨부된 이미지 */}
        {isUser && message.images && message.images.length > 0 && (
          <div className="flex gap-2 flex-wrap justify-end">
            {message.images.map((img, i) => (
              <div
                key={i}
                className="rounded-lg overflow-hidden border border-gray-200 size-16 shrink-0"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`data:${img.mimeType};base64,${img.base64}`}
                  alt=""
                  className="size-full object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {/* Assistant reasoning (생각 과정) — DB에서 불러온 완료된 것 */}
        {!isUser && message.reasoningContent && (
          <div className="rounded-2xl border border-gray-200 bg-gray-50 overflow-hidden">
            <button
              type="button"
              onClick={() => setReasoningOpen((v) => !v)}
              className="w-full flex items-center gap-2 px-4 py-2 text-xs text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <BrainCircuit className="size-3.5 shrink-0" />
              <span className="font-medium">생각 과정</span>
              <ChevronDown
                className={cn(
                  "size-3.5 ml-auto transition-transform",
                  reasoningOpen && "rotate-180",
                )}
              />
            </button>
            {reasoningOpen && (
              <div className="px-4 pb-3 text-xs text-gray-500 leading-relaxed whitespace-pre-wrap border-t border-gray-200 pt-2">
                {message.reasoningContent}
              </div>
            )}
          </div>
        )}

        {/* 메시지 본문 */}
        <div
          className={cn(
            "rounded-2xl px-4 py-2 text-sm leading-relaxed whitespace-pre-wrap",
            isUser
              ? "bg-black text-white rounded-br-sm"
              : "bg-gray-100 text-gray-900 rounded-bl-sm",
          )}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
}

export default ChatMessage;
