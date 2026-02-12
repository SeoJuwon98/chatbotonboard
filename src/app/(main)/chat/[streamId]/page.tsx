import { notFound } from "next/navigation";
import ChatView from "./_components/ChatView.client";
import { messagesApi } from "@/lib/api";
import type { Message } from "./types";

interface ChatStreamPageProps {
  params: Promise<{ streamId: string }>;
}

const ChatStreamPage = async ({ params }: ChatStreamPageProps) => {
  const { streamId } = await params;

  let initialMessages: Message[] = [];

  try {
    initialMessages = await messagesApi.list(streamId);
  } catch {
    // 세션이 존재하지 않으면 404
    notFound();
  }

  return <ChatView streamId={streamId} initialMessages={initialMessages} />;
};

export default ChatStreamPage;
