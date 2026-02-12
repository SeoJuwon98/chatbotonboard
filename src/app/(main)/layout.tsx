import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import MainSidebar, { ChatSession } from "./_components/MainSidebar";
import Header from "./_components/Header";

const chatList: ChatSession[] = [
  {
    createdAt: "2026-02-11",
    updatedAt: "2026-02-11",
    title: "Chat 122    dashat 122    dashat 122    dashat 122    das",
    streamId: "1",
  },
  {
    createdAt: "2026-02-11",
    updatedAt: "2026-02-11",
    title: "Chat 2",
    streamId: "2",
  },
];
const HEADER_HEIGHT = "3rem";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-top-offset": HEADER_HEIGHT,
        } as React.CSSProperties
      }
    >
      <div className="flex flex-col h-screen w-screen">
        <Header />
        <div className="flex flex-1 min-h-0">
          <MainSidebar chatList={chatList} />
          <main className="flex-1 flex flex-col min-w-0">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
