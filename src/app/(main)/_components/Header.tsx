"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

function Header() {
  const isMobile = useIsMobile();

  return (
    <header className="h-12 shrink-0 border-b flex items-center justify-between w-full">
      <div className="flex items-center w-12 min-w-12 px-2">
        <SidebarTrigger className="size-8 stroke-1" />
      </div>
      <div className="flex items-center justify-end shrink-0 w-12 min-w-12 px-2">
        {isMobile ? (
          <Button asChild className="bg-black h-8 hover:bg-black/80 rounded-sm">
            <Link href="/">
              <Plus className="size-4 text-white" />
              <span className="font-medium text-sm text-white">새채팅</span>
            </Link>
          </Button>
        ) : null}
      </div>
    </header>
  );
}

export default Header;
