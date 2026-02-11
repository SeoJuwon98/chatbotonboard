import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import MainSidebar, { ChatSession } from "./_components/MainSidebar";

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
const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <div className="flex flex-1 h-screen w-screen">
        <MainSidebar chatList={chatList} />
        <main className="flex-1 pt-12">{children}</main>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
