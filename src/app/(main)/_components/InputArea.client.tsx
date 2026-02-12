"use client";

import {
  useState,
  useCallback,
  useRef,
  useEffect,
  type KeyboardEvent,
  type ChangeEvent,
} from "react";
import TextareaAutosize from "react-textarea-autosize";
import { cn } from "@/lib/utils";
import { SendHorizontal, Square, ImagePlus, X } from "lucide-react";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
} from "@/components/ui/combobox";
import {
  CHAT_MODELS,
  VL_MODEL_IDS,
  type ChatModelId,
} from "@chatbot/shared";

export { CHAT_MODELS, type ChatModelId };

const MAX_IMAGES = 4;
const ACCEPT_IMAGES = "image/*";

interface InputAreaProps {
  placeholder?: string;
  onSubmit?: (message: string, images?: File[]) => void;
  className?: string;
  disabled?: boolean;
  isStreaming?: boolean;
  onStop?: () => void;
  model?: ChatModelId;
  onModelChange?: (model: ChatModelId) => void;
}

const defaultModel: ChatModelId = "GPT-OSS-120B";

const InputArea = ({
  placeholder = "메시지를 입력하세요",
  onSubmit,
  className,
  disabled = false,
  isStreaming = false,
  onStop,
  model: controlledModel,
  onModelChange,
}: InputAreaProps) => {
  const [value, setValue] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [internalModel, setInternalModel] = useState<ChatModelId | null>(
    defaultModel,
  );
  const model = controlledModel ?? internalModel ?? defaultModel;
  const setModel = useCallback(
    (v: ChatModelId | null) => {
      const next = v ?? defaultModel;
      onModelChange?.(next);
      if (controlledModel == null) setInternalModel(next);
      if (!VL_MODEL_IDS.includes(next)) setImages([]);
    },
    [controlledModel, onModelChange],
  );

  const isVlModel = VL_MODEL_IDS.includes(model);

  const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setImages((prev) => {
      const next = [...prev, ...Array.from(files)].slice(0, MAX_IMAGES);
      return next;
    });
    e.target.value = "";
  }, []);

  const removeImage = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const [imageUrls, setImageUrls] = useState<string[]>([]);
  useEffect(() => {
    const urls = images.map((f) => URL.createObjectURL(f));
    setImageUrls((prev) => {
      prev.forEach((u) => URL.revokeObjectURL(u));
      return urls;
    });
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [images]);

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSubmit?.(trimmed, isVlModel && images.length > 0 ? images : undefined);
    setValue("");
    setImages([]);
  }, [value, onSubmit, disabled, isVlModel, images]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <div
      className={cn(
        "flex flex-col gap-2 w-full max-w-[768px] min-w-0 border border-gray-300 rounded-2xl p-4 pt-3 bg-white transition-shadow focus-within:shadow-sm focus-within:border-gray-400",
        className,
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPT_IMAGES}
        multiple
        className="hidden"
        aria-hidden
        onChange={handleFileChange}
      />
      {/* VL 모델 + 이미지 있을 때: 미리보기를 메시지 입력창 위에 표시 */}
      {isVlModel && images.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {images.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50 size-14 shrink-0"
            >
              {imageUrls[index] && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={imageUrls[index]}
                  alt=""
                  className="size-full object-cover"
                />
              )}
              <button
                type="button"
                onClick={() => removeImage(index)}
                aria-label="이미지 제거"
                className="absolute top-0.5 right-0.5 rounded-full p-0.5 bg-black/60 text-white hover:bg-black/80"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
          {images.length < MAX_IMAGES && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="size-14 shrink-0 rounded-lg border border-dashed border-gray-300 bg-gray-50/50 hover:border-gray-400 hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="이미지 추가"
            >
              <ImagePlus className="size-5" />
            </button>
          )}
        </div>
      )}
      <TextareaAutosize
        id="textarea-message"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        minRows={1}
        maxRows={6}
        className={cn(
          "flex w-full bg-transparent px-2 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          "resize-none min-h-10",
          "[&::-webkit-scrollbar]:w-2",
          "[&::-webkit-scrollbar-track]:bg-transparent",
          "[&::-webkit-scrollbar-thumb]:bg-gray-300",
          "[&::-webkit-scrollbar-thumb]:rounded-full",
          "[&::-webkit-scrollbar-thumb]:hover:bg-gray-400",
        )}
      />
      <div className="flex flex-wrap items-center w-full px-1 gap-2 min-h-9">
        <Combobox
          value={model}
          onValueChange={(v) => setModel(v as ChatModelId | null)}
        >
          <ComboboxInput
            disabled={disabled}
            showClear={false}
            placeholder="모델 선택"
            readOnly
            className="h-8 min-w-0 max-w-[140px] sm:max-w-[220px] border-gray-200 text-sm cursor-pointer shrink-0 truncate"
          />
          <ComboboxContent side="top" sideOffset={6}>
            <ComboboxList>
              {CHAT_MODELS.map((modelId) => (
                <ComboboxItem key={modelId} value={modelId}>
                  {modelId}
                </ComboboxItem>
              ))}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        {/* VL 모델일 때: 같은 줄에는 "이미지 첨부" 버튼만 (미리보기는 입력창 위로 올림) */}
        <div className="flex-1 flex items-center gap-2 min-w-0 basis-0 sm:basis-auto">
          {isVlModel && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="h-8 rounded-lg border border-dashed border-gray-300 bg-gray-50/50 hover:border-gray-400 hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1.5 px-2 sm:px-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed shrink-0 min-w-0"
              aria-label="이미지를 첨부하여 질문하기"
            >
              <ImagePlus className="size-4 shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">
                이미지 첨부
              </span>
            </button>
          )}
        </div>
        {isStreaming ? (
          <button
            type="button"
            onClick={onStop}
            aria-label="응답 중지"
            className="rounded-full p-2.5 transition-colors shrink-0 bg-red-500 text-white hover:bg-red-600 cursor-pointer"
          >
            <Square className="size-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSend}
            aria-label="메시지 전송"
            className={cn(
              "rounded-full p-2.5 transition-colors shrink-0",
              canSend
                ? "bg-black text-white hover:bg-black/80 cursor-pointer"
                : "bg-gray-200 text-gray-400 cursor-not-allowed",
            )}
          >
            <SendHorizontal className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default InputArea;
