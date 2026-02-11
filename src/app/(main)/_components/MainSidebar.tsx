"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react"; // 아이콘 추가

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export interface ChatSession {
  createdAt: string;
  updatedAt: string;
  title: string;
  streamId: string;
}

interface MainSidebarProps {
  chatList: ChatSession[];
}

const MainSidebar = ({ chatList }: MainSidebarProps) => {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex flex-col py-4">
        <div className="flex items-center">
          <SidebarTrigger className="stroke-1 size-8" />
        </div>
        <SidebarMenu className="py-1">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="새로운 채팅"
              className="font-medium border bg-black border-gray-300 hover:bg-black/80 rounded-sm"
            >
              <Link href="/">
                <Plus className="size-5 text-white" />
                <span className="font-bold text-white">새로운 채팅</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          {" "}
          <SidebarGroupLabel className="whitespace-nowrap">
            내 채팅
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {chatList.length === 0 ? (
                <div className="text-sm text-gray-600 p-2 whitespace-nowrap">
                  채팅 내역이 없습니다.
                </div>
              ) : (
                chatList.map((chat) => (
                  <SidebarMenuItem key={chat.streamId}>
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        "text-base hover:bg-gray-200",
                        pathname === `/chat/${chat.streamId}`
                          ? "bg-gray-200"
                          : "",
                      )}
                    >
                      <Link href={`/chat/${chat.streamId}`}>
                        <span className="truncate">{chat.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default MainSidebar;
