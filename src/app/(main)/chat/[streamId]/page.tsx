import ChatView from "./_components/ChatView.client";
import type { Message } from "./types";

interface ChatStreamPageProps {
  params: Promise<{ streamId: string }>;
}

// Mock messages for UI prototype
const mockMessages: Message[] = [
  {
    id: "1",
    role: "user",
    content: "비트코인의 현재 시세와 전망에 대해 알려주세요.",
  },
  {
    id: "2",
    role: "assistant",
    content:
      "현재 비트코인(BTC)의 시세와 전망에 대해 말씀드리겠습니다.\n\n현재 시세\n비트코인은 최근 강한 상승세를 보이며 주요 저항선을 돌파했습니다. 기관 투자자들의 지속적인 매수세가 가격을 지지하고 있습니다.\n\n단기 전망\n• ETF 승인 이후 기관 자금 유입 지속\n• 반감기 효과로 인한 공급 감소\n• 글로벌 경제 불확실성 속 안전자산 수요 증가\n\n주의 사항\n암호화폐 투자는 높은 변동성을 가지고 있으므로, 투자 결정 시 신중한 판단이 필요합니다. 분산 투자와 리스크 관리를 권장합니다.",
  },
  {
    id: "3",
    role: "user",
    content: "이더리움과 비교하면 어떤가요?",
  },
  {
    id: "4",
    role: "assistant",
    content: "비트코인과 이더리움을 비교해 드리겠습니다.",
  },
];

const ChatStreamPage = async ({ params }: ChatStreamPageProps) => {
  const { streamId } = await params;

  return <ChatView streamId={streamId} initialMessages={mockMessages} />;
};

export default ChatStreamPage;
