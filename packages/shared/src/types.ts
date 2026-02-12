// ─── Chat Model ───

export const CHAT_MODELS = ["vllm-main", "vl-main"] as const;

export type ChatModelId = (typeof CHAT_MODELS)[number];

/** Vision-Language 모델 목록 */
export const VL_MODEL_IDS: ChatModelId[] = ["vl-main"];

// ─── Image ───

export interface ImageAttachment {
  base64: string;
  mimeType: string;
}

// ─── Message ───

export interface Message {
  id: string;
  streamId: string;
  role: "user" | "assistant";
  content: string;
  reasoningContent?: string | null;
  images?: ImageAttachment[] | null;
  orderIndex: number;
  createdAt: string;
}

// ─── Chat Session ───

export interface ChatSession {
  id: string;
  title: string;
  model: ChatModelId;
  createdAt: string;
  updatedAt: string;
}

// ─── API Request / Response ───

export interface CreateSessionRequest {
  id?: string;
  title?: string;
  model: ChatModelId;
}

export interface CreateSessionResponse {
  session: ChatSession;
}

export interface CreateMessageRequest {
  role: "user" | "assistant";
  content: string;
  reasoningContent?: string | null;
  images?: ImageAttachment[] | null;
}

export interface CreateMessageResponse {
  message: Message;
}

export interface ChatStreamRequest {
  model: ChatModelId;
  messages: OpenAIChatMessage[];
}

// ─── OpenAI-Compatible Types ───

export interface OpenAITextContent {
  type: "text";
  text: string;
}

export interface OpenAIImageContent {
  type: "image_url";
  image_url: { url: string };
}

export type OpenAIContentPart = OpenAITextContent | OpenAIImageContent;

export interface OpenAIChatMessage {
  role: "user" | "assistant" | "system";
  content: string | OpenAIContentPart[];
}

// ─── SSE Stream Events ───

export interface StreamContentDelta {
  type: "content_delta";
  delta: string;
}

export interface StreamReasoningDelta {
  type: "reasoning_delta";
  delta: string;
}

export interface StreamError {
  type: "error";
  message: string;
}

export interface StreamDone {
  type: "done";
}

export type StreamEvent =
  | StreamContentDelta
  | StreamReasoningDelta
  | StreamError
  | StreamDone;
