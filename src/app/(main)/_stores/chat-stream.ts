import { create } from "zustand";
import type { StreamEvent, ChatModelId } from "@chatbot/shared";

interface ChatStreamState {
  // ─── State ───
  streamingStreamId: string | null;
  isStreaming: boolean;
  partialContent: string;
  reasoningContent: string;
  error: string | null;
  abortController: AbortController | null;
  model: ChatModelId;

  // ─── Actions ───
  startStream: (streamId: string) => AbortController;
  handleEvent: (event: StreamEvent) => void;
  stopStream: () => void;
  completeStream: () => { content: string; reasoningContent: string | null };
  setError: (message: string) => void;
  setModel: (model: ChatModelId) => void;
  reset: () => void;
}

const initialState = {
  streamingStreamId: null,
  isStreaming: false,
  partialContent: "",
  reasoningContent: "",
  error: null,
  abortController: null,
  model: "vllm-main" as ChatModelId,
};

export const useChatStreamStore = create<ChatStreamState>((set, get) => ({
  ...initialState,

  startStream(streamId: string) {
    // 기존 스트림 중단
    const prev = get().abortController;
    if (prev) prev.abort();

    const controller = new AbortController();
    set({
      streamingStreamId: streamId,
      isStreaming: true,
      partialContent: "",
      reasoningContent: "",
      error: null,
      abortController: controller,
    });
    return controller;
  },

  handleEvent(event: StreamEvent) {
    const state = get();
    if (!state.isStreaming) return;

    switch (event.type) {
      case "content_delta":
        set({ partialContent: state.partialContent + event.delta });
        break;
      case "reasoning_delta":
        set({ reasoningContent: state.reasoningContent + event.delta });
        break;
      case "error":
        set({ error: event.message, isStreaming: false });
        break;
      case "done":
        // done은 completeStream에서 처리
        break;
    }
  },

  stopStream() {
    const { abortController } = get();
    if (abortController) abortController.abort();
    set({ isStreaming: false, abortController: null });
  },

  completeStream() {
    const { partialContent, reasoningContent } = get();
    set({
      isStreaming: false,
      abortController: null,
      streamingStreamId: null,
    });
    return {
      content: partialContent,
      reasoningContent: reasoningContent || null,
    };
  },

  setError(message: string) {
    set({ error: message, isStreaming: false, abortController: null });
  },

  setModel(model: ChatModelId) {
    set({ model });
  },

  reset() {
    const { abortController } = get();
    if (abortController) abortController.abort();
    set(initialState);
  },
}));
