"use client";

import { RotateCcw, AlertCircle } from "lucide-react";

interface ChatErrorProps {
  message: string;
  onRetry?: () => void;
}

function ChatError({ message, onRetry }: ChatErrorProps) {
  return (
    <div className="flex w-full justify-center">
      <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 max-w-[85%]">
        <AlertCircle className="size-4 shrink-0" />
        <span className="flex-1 min-w-0">{message}</span>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="flex items-center gap-1.5 shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium bg-red-100 hover:bg-red-200 text-red-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="size-3" />
            다시 시도
          </button>
        )}
      </div>
    </div>
  );
}

export default ChatError;
