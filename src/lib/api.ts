import type {
  ChatSession,
  Message,
  CreateSessionRequest,
  CreateSessionResponse,
  CreateMessageRequest,
  CreateMessageResponse,
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

async function fetchJSON<T>(path: string, init?: RequestInit): Promise<T> {
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
    return fetchJSON<CreateMessageResponse>(`/chat/${streamId}/messages`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
