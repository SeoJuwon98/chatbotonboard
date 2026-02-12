import { SidebarProvider } from "@/components/ui/sidebar";
import MainSidebar from "./_components/MainSidebar.client";
import Header from "./_components/Header.client";
import { sessionsApi } from "@/lib/api";

const HEADER_HEIGHT = "3rem";

const MainLayout = async ({ children }: { children: React.ReactNode }) => {
  let chatList: { createdAt: string; updatedAt: string; title: string; streamId: string }[] = [];

  try {
    const sessions = await sessionsApi.list();
    chatList = sessions.map((s) => ({
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      title: s.title,
      streamId: s.id,
    }));
  } catch {
    // 백엔드 미접속 시 빈 목록
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-top-offset": HEADER_HEIGHT,
        } as React.CSSProperties
      }
    >
      <div className="flex flex-col h-screen w-full max-w-full overflow-x-hidden">
        <Header />
        <div className="flex flex-1 min-h-0 min-w-0">
          <MainSidebar chatList={chatList} />
          <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
