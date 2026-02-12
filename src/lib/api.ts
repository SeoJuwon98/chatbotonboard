import type {
  ChatSession,
  Message,
  CreateSessionRequest,
  CreateSessionResponse,
  CreateMessageRequest,
  CreateMessageResponse,
  ChatStreamRequest,
  StreamEvent,
} from "@chatbot/shared";

/**
 * 서버(SSR)에서는 절대 URL, 클라이언트에서는 상대 경로 사용.
 * next.config.ts rewrites로 /api/* → backend 프록시.
 */
function getBaseUrl(): string {
  if (typeof window === "undefined") {
    // SSR: 직접 백엔드 호출
    return process.env.BACKEND_URL ?? "http://localhost:4000";
  }
  // 브라우저: Next.js 프록시 통해 호출
  return "/api";
}

async function fetchJSON<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const base = getBaseUrl();
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "Unknown error");
    throw new Error(`API Error (${res.status}): ${errorText}`);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

// ─── Sessions ───

export const sessionsApi = {
  list(): Promise<ChatSession[]> {
    return fetchJSON<ChatSession[]>("/sessions");
  },

  create(data: CreateSessionRequest): Promise<CreateSessionResponse> {
    return fetchJSON<CreateSessionResponse>("/sessions", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  delete(id: string): Promise<void> {
    return fetchJSON<void>(`/sessions/${id}`, {
      method: "DELETE",
    });
  },
};

// ─── Messages ───

export const messagesApi = {
  list(streamId: string): Promise<Message[]> {
    return fetchJSON<Message[]>(`/chat/${streamId}/messages`);
  },

  create(
    streamId: string,
    data: CreateMessageRequest,
  ): Promise<CreateMessageResponse> {
    return fetchJSON<CreateMessageResponse>(
      `/chat/${streamId}/messages`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
  },
};

// ─── Chat Stream (OpenAI-compatible API) ───

/** OpenAI 스트리밍 청크 형식 */
interface OpenAIChunk {
  id?: string;
  object?: string;
  choices?: Array<{
    index?: number;
    delta?: { content?: string; reasoning_content?: string; role?: string };
    finish_reason?: string | null;
  }>;
  error?: { message: string; type?: string };
}

export const chatStreamApi = {
  /**
   * OpenAI 호환 /v1/chat/completions 스트리밍 요청.
   * SSE를 파싱해 OpenAI 청크를 StreamEvent로 변환하여 콜백으로 전달.
   */
  async stream(
    data: ChatStreamRequest,
    options: {
      signal?: AbortSignal;
      onEvent: (event: StreamEvent) => void;
    },
  ): Promise<void> {
    const base = getBaseUrl();
    const res = await fetch(`${base}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: data.model,
        messages: data.messages,
        stream: true,
      }),
      signal: options.signal,
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "Unknown error");
      throw new Error(`Stream API Error (${res.status}): ${errorText}`);
    }

    if (!res.body) {
      throw new Error("응답 스트림이 없습니다.");
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data: ")) continue;

        const jsonStr = trimmed.slice(6);
        if (jsonStr === "[DONE]") {
          options.onEvent({ type: "done" });
          continue;
        }

        try {
          const chunk = JSON.parse(jsonStr) as OpenAIChunk;

          if (chunk.error) {
            options.onEvent({ type: "error", message: chunk.error.message });
            options.onEvent({ type: "done" });
            return;
          }

          const choice = chunk.choices?.[0];
          const delta = choice?.delta;
          if (delta?.reasoning_content) {
            options.onEvent({
              type: "reasoning_delta",
              delta: delta.reasoning_content,
            });
          }
          if (delta?.content) {
            options.onEvent({ type: "content_delta", delta: delta.content });
          }
        } catch {
          // 파싱 실패 시 무시
        }
      }
    }

    options.onEvent({ type: "done" });
  },
};
