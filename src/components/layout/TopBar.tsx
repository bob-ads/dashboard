"use client";

import { Menu } from "lucide-react";

interface TopBarProps {
  onMenuClick: () => void;
  title?: string;
}

export function TopBar({ onMenuClick, title }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 -ml-2 hover:bg-accent rounded-md"
      >
        <Menu className="h-5 w-5" />
      </button>
      {title && (
        <h1 className="text-lg font-semibold truncate">{title}</h1>
      )}
    </header>
  );
}
