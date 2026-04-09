import type { SheetConfig } from "./sheets";
import type { WidgetConfig } from "./dashboard";

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface Client {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShareLink {
  id: string;
  clientId: string;
  token: string;
  label: string | null;
  expiresAt: Date | null;
  isActive: boolean;
  createdAt: Date;
}

export interface ClientWithRelations extends Client {
  user: {
    id: string;
    username: string;
    role: "ADMIN" | "CLIENT";
  } | null;
  sheetConfigs: SheetConfig[];
  widgetConfigs: WidgetConfig[];
}
