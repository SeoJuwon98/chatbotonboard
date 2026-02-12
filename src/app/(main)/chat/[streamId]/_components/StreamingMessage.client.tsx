"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, BrainCircuit } from "lucide-react";

interface StreamingMessageProps {
  content: string;
  reasoningContent: string;
  isStreaming: boolean;
}

function StreamingMessage({
  content,
  reasoningContent,
  isStreaming,
}: StreamingMessageProps) {
  const [reasoningOpen, setReasoningOpen] = useState(true);

  return (
    <div className="flex w-full justify-start">
      <div className="max-w-[85%] flex flex-col gap-2">
        {/* Reasoning (생각 과정) */}
        {reasoningContent && (
          <div className="rounded-2xl border border-gray-200 bg-gray-50 overflow-hidden">
            <button
              type="button"
              onClick={() => setReasoningOpen((v) => !v)}
              className="w-full flex items-center gap-2 px-4 py-2 text-xs text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <BrainCircuit className="size-3.5 shrink-0" />
              <span className="font-medium">
                {isStreaming ? "생각하는 중..." : "생각 과정"}
              </span>
              <ChevronDown
                className={cn(
                  "size-3.5 ml-auto transition-transform",
                  reasoningOpen && "rotate-180",
                )}
              />
            </button>
            {reasoningOpen && (
              <div className="px-4 pb-3 text-xs text-gray-500 leading-relaxed whitespace-pre-wrap border-t border-gray-200 pt-2">
                {reasoningContent}
                {isStreaming && !content && (
                  <span className="inline-block w-1.5 h-4 bg-gray-400 ml-0.5 animate-pulse rounded-sm" />
                )}
              </div>
            )}
          </div>
        )}

        {/* Content */}
        {content && (
          <div className="rounded-2xl rounded-bl-sm px-4 py-2 text-sm leading-relaxed whitespace-pre-wrap bg-gray-100 text-gray-900">
            {content}
            {isStreaming && (
              <span className="inline-block w-1.5 h-4 bg-gray-400 ml-0.5 animate-pulse rounded-sm" />
            )}
          </div>
        )}

        {/* 아직 아무 내용도 없을 때 로딩 표시 */}
        {!content && !reasoningContent && isStreaming && (
          <div className="rounded-2xl rounded-bl-sm px-4 py-3 bg-gray-100 text-gray-400 text-sm flex items-center gap-2">
            <span className="flex gap-1">
              <span className="size-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0ms]" />
              <span className="size-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:150ms]" />
              <span className="size-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]" />
            </span>
            <span>응답 생성 중...</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default StreamingMessage;
