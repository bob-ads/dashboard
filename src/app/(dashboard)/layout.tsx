"use client";

import { signOut, useSession } from "next-auth/react";
import { BarChart3, LogOut } from "lucide-react";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="sticky top-0 z-30 bg-background border-b">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-14 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span className="font-bold">Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            {session?.user?.name && (
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {session.user.name}
              </span>
            )}
            {session?.user?.role === "ADMIN" && (
              <Link
                href="/admin"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Admin
              </Link>
            )}
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="p-2 hover:bg-accent rounded-md transition-colors"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto p-4 sm:p-6">{children}</main>
    </div>
  );
}
