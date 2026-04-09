import { prisma } from "@/lib/prisma";
import { BarChart3, Users, Link2, RefreshCw } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  const [clientCount, activeLinks, recentSync] = await Promise.all([
    prisma.client.count(),
    prisma.shareLink.count({ where: { isActive: true } }),
    prisma.cachedSheetData.findFirst({
      orderBy: { syncedAt: "desc" },
      select: { syncedAt: true },
    }),
  ]);

  const stats = [
    {
      label: "Total Clients",
      value: clientCount,
      icon: Users,
    },
    {
      label: "Active Share Links",
      value: activeLinks,
      icon: Link2,
    },
    {
      label: "Last Sync",
      value: recentSync
        ? new Date(recentSync.syncedAt).toLocaleString()
        : "Never",
      icon: RefreshCw,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Admin Overview</h2>
        <p className="text-muted-foreground">
          Manage your coaching clients and their dashboards.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border bg-card p-6 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold">
                  {typeof stat.value === "number"
                    ? stat.value.toLocaleString()
                    : stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h3 className="font-semibold mb-2">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <a
            href="/admin/clients/new"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
          >
            <Users className="h-4 w-4 mr-2" />
            Add Client
          </a>
          <a
            href="/admin/clients"
            className="inline-flex items-center justify-center rounded-md border bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent transition-colors"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            View All Clients
          </a>
        </div>
      </div>
    </div>
  );
}
