"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewClientPage() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [createLogin, setCreateLogin] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  function generateSlug(input: string) {
    return input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        slug,
        ...(createLogin ? { username, password } : {}),
      }),
    });

    if (res.ok) {
      const client = await res.json();
      toast("Client created successfully", "success");
      router.push(`/admin/clients/${client.id}`);
    } else {
      const err = await res.json();
      toast(err.error || "Failed to create client", "destructive");
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/clients"
          className="p-2 hover:bg-accent rounded-md transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Add Client</h2>
          <p className="text-muted-foreground">
            Create a new coaching client and configure their dashboard.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border bg-card p-6 shadow-sm space-y-6">
        <div className="space-y-4">
          <h3 className="font-semibold">Client Details</h3>
          <div className="space-y-2">
            <label className="text-sm font-medium">Client Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!slug || slug === generateSlug(name)) {
                  setSlug(generateSlug(e.target.value));
                }
              }}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="e.g., Joe's Gym"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">URL Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(generateSlug(e.target.value))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="e.g., joes-gym"
              required
            />
            <p className="text-xs text-muted-foreground">
              Used in the dashboard URL
            </p>
          </div>
        </div>

        <div className="border-t pt-6 space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="createLogin"
              checked={createLogin}
              onChange={(e) => setCreateLogin(e.target.checked)}
              className="h-4 w-4 rounded border-input"
            />
            <label htmlFor="createLogin" className="text-sm font-medium">
              Create login credentials for this client
            </label>
          </div>

          {createLogin && (
            <div className="grid gap-4 sm:grid-cols-2 pl-7">
              <div className="space-y-2">
                <label className="text-sm font-medium">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="client-username"
                  required={createLogin}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Set a password"
                  required={createLogin}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {saving ? "Creating..." : "Create Client"}
          </button>
          <Link
            href="/admin/clients"
            className="inline-flex items-center rounded-md border px-4 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
