"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Settings, Eye, Trash2, ExternalLink } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface Client {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  user?: { id: string; username: string } | null;
  sheetConfigs: Array<{ id: string; tabName: string; dataCategory: string }>;
  _count: { widgetConfigs: number; shareLinks: number };
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchClients();
  }, []);

  async function fetchClients() {
    const res = await fetch("/api/clients");
    if (res.ok) {
      setClients(await res.json());
    }
    setLoading(false);
  }

  async function deleteClient(id: string, name: string) {
    if (!confirm(`Delete client "${name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast("Client deleted", "success");
      fetchClients();
    } else {
      toast("Failed to delete client", "destructive");
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Clients</h2>
          <p className="text-muted-foreground">
            Manage your coaching clients and their dashboard settings.
          </p>
        </div>
        <Link
          href="/admin/clients/new"
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Client
        </Link>
      </div>

      {clients.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <p className="text-muted-foreground mb-4">
            No clients yet. Add your first client to get started.
          </p>
          <Link
            href="/admin/clients/new"
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Client
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Client
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden md:table-cell">
                  Login
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">
                  Data Sources
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">
                  Status
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="py-3 px-4">
                    <div className="font-medium">{client.name}</div>
                    <div className="text-sm text-muted-foreground">/{client.slug}</div>
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell">
                    {client.user ? (
                      <span className="text-sm">{client.user.username}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground italic">
                        No login
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 hidden sm:table-cell">
                    <span className="text-sm">
                      {client.sheetConfigs.length} sheet
                      {client.sheetConfigs.length !== 1 ? "s" : ""}
                    </span>
                  </td>
                  <td className="py-3 px-4 hidden lg:table-cell">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        client.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {client.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/clients/${client.id}`}
                        className="p-2 hover:bg-accent rounded-md transition-colors"
                        title="Settings"
                      >
                        <Settings className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/admin/clients/${client.id}/preview`}
                        className="p-2 hover:bg-accent rounded-md transition-colors"
                        title="Preview"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => deleteClient(client.id, client.name)}
                        className="p-2 hover:bg-destructive/10 text-destructive rounded-md transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
