import type { UIMessage } from "ai";
import type { Message, ImageAttachment } from "@chatbot/shared";

/** ChatMessage가 렌더링하는 공통 표시 형식 */
export interface DisplayMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  reasoningContent?: string | null;
  images?: ImageAttachment[] | null;
}

/** DB Message → 표시용 형식 */
export function messageToDisplay(m: Message): DisplayMessage {
  return {
    id: m.id,
    role: m.role,
    content: m.content,
    reasoningContent: m.reasoningContent ?? null,
    images: m.images ?? null,
  };
}

/** AI SDK UIMessage → 표시용 형식 */
export function uiMessageToDisplay(m: UIMessage): DisplayMessage {
  let content = "";
  let reasoningContent: string | null = null;
  const images: ImageAttachment[] = [];

  for (const part of m.parts) {
    if (part.type === "text") {
      content += part.text;
    } else if (part.type === "reasoning") {
      reasoningContent = (reasoningContent ?? "") + part.text;
    } else if (part.type === "file") {
      const url = part.url;
      const mimeType = part.mediaType ?? "image/png";
      if (url.startsWith("data:")) {
        const [, base64] = url.split(",");
        images.push({ base64: base64 ?? "", mimeType });
      }
    }
  }

  return {
    id: m.id,
    role: m.role === "system" ? "assistant" : m.role,
    content,
    reasoningContent: reasoningContent || null,
    images: images.length > 0 ? images : null,
  };
}

/** DB Message[] → useChat initialMessages (UIMessage 형식) */
export function messagesToUIMessages(messages: Message[]): UIMessage[] {
  return messages.map((m) => messageToUIMessage(m));
}

/** DB Message → UIMessage */
export function messageToUIMessage(m: Message): UIMessage {
  const parts: UIMessage["parts"] = [];

  if (m.role === "assistant" && m.reasoningContent) {
    parts.push({ type: "reasoning" as const, text: m.reasoningContent });
  }
  parts.push({ type: "text" as const, text: m.content });

  if (m.role === "user" && m.images && m.images.length > 0) {
    for (const img of m.images) {
      parts.push({
        type: "file" as const,
        mediaType: img.mimeType,
        url: `data:${img.mimeType};base64,${img.base64}`,
      });
    }
  }

  return {
    id: m.id,
    role: m.role,
    parts,
  };
}
