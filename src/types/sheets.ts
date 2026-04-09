// ─── Enums ───────────────────────────────────────────────────────────────────

export enum DataCategory {
  AD_METRICS = "AD_METRICS",
  LEADS = "LEADS",
  SALES = "SALES",
  CUSTOM = "CUSTOM",
}

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface ColumnMapping {
  id: string;
  sheetConfigId: string;
  sheetColumn: string;
  metricKey: string;
  dataType: "NUMBER" | "CURRENCY" | "PERCENTAGE" | "TEXT" | "DATE";
  displayName: string;
}

export interface SheetConfig {
  id: string;
  clientId: string;
  spreadsheetId: string;
  spreadsheetUrl: string;
  tabName: string;
  dataCategory: DataCategory;
  dateColumn: string;
  dateFormat: string;
  createdAt: Date;
  updatedAt: Date;
  columnMappings?: ColumnMapping[];
}

export interface SyncResult {
  clientId: string;
  sheetsProcessed: number;
  rowsUpserted: number;
  errors: string[];
}
