import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ShareDashboard } from "./ShareDashboard";

export const dynamic = "force-dynamic";

export default async function SharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const link = await prisma.shareLink.findUnique({
    where: { token },
    include: {
      client: {
        include: {
          widgetConfigs: {
            where: { isVisible: true },
            orderBy: { position: "asc" },
          },
        },
      },
    },
  });

  if (!link || !link.isActive) {
    notFound();
  }

  if (link.expiresAt && link.expiresAt < new Date()) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="bg-background border-b">
        <div className="max-w-7xl mx-auto flex items-center h-14 px-4 sm:px-6">
          <span className="font-bold">{link.client.name} Dashboard</span>
        </div>
      </header>
      <main className="max-w-7xl mx-auto p-4 sm:p-6">
        <ShareDashboard
          clientId={link.clientId}
          token={token}
          widgets={link.client.widgetConfigs.map((w) => ({
            ...w,
            config: w.config as Record<string, unknown>,
          }))}
        />
      </main>
    </div>
  );
}
