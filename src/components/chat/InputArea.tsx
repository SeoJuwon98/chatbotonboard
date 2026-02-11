"use client";

import TextareaAutosize from "react-textarea-autosize";
import { cn } from "@/lib/utils"; // shadcn의 class 병합 유틸
import { SendHorizonal, SendIcon } from "lucide-react";

const InputArea = () => {
  return (
    <div className="flex flex-col gap-2 max-w-[768px] justify-center items-center border border-gray-300 rounded-2xl p-4">
      <TextareaAutosize
        id="textarea-message"
        placeholder="아무말이나 해보세요."
        minRows={1}
        maxRows={6}
        className={cn(
          "flex w-full border border-input bg-transparent px-3 py-2 rounded-md text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          "resize-none min-h-10",

          /* ▼ 스크롤바 커스텀 스타일 ▼ */
          "[&::-webkit-scrollbar]:w-2" /* 스크롤바 너비 설정 (살짝 얇게) */,
          "[&::-webkit-scrollbar-track]:bg-transparent" /* ★ 핵심: 트랙 배경 투명하게 */,
          "[&::-webkit-scrollbar-thumb]:bg-gray-300" /* 막대 색상 (연한 회색) */,
          "[&::-webkit-scrollbar-thumb]:rounded-full" /* 막대 둥글게 */,

          /* (선택) 마우스 올렸을 때 막대 진하게 */
          "[&::-webkit-scrollbar-thumb]:hover:bg-gray-400",
        )}
      />
      <div className="flex justify-between w-full px-1">
        <div className="flex justify-start items-center">나는 모델</div>
        <button className="rounded-full bg-black text-white px-3 py-3 justify-center items-center">
          <SendHorizonal className="size-5" />
        </button>
      </div>
    </div>
  );
};

export default InputArea;
