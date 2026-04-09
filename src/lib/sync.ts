import { prisma } from "./prisma";
import { fetchTabData } from "./google-sheets";
import { parseAdMetrics, parseLeads, type ParsedMetricRow } from "./data-merger";

export interface SyncResult {
  clientId: string;
  clientName: string;
  sheetsProcessed: number;
  rowsUpserted: number;
  errors: string[];
}

/**
 * Sync data from Google Sheets for a single client.
 * Fetches each configured tab, parses the data, and upserts into CachedSheetData.
 */
export async function syncClient(clientId: string): Promise<SyncResult> {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: {
      sheetConfigs: { include: { columnMappings: true } },
    },
  });

  if (!client) {
    return {
      clientId,
      clientName: "Unknown",
      sheetsProcessed: 0,
      rowsUpserted: 0,
      errors: ["Client not found"],
    };
  }

  const result: SyncResult = {
    clientId,
    clientName: client.name,
    sheetsProcessed: 0,
    rowsUpserted: 0,
    errors: [],
  };

  for (const config of client.sheetConfigs) {
    try {
      const { headers, rows } = await fetchTabData(
        config.spreadsheetId,
        config.tabName
      );

      if (rows.length === 0) {
        result.sheetsProcessed++;
        continue;
      }

      const syncConfig = {
        sheetConfigId: config.id,
        dataCategory: config.dataCategory,
        dateColumn: config.dateColumn,
        dateFormat: config.dateFormat,
        columnMappings: config.columnMappings.map((m) => ({
          sheetColumn: m.sheetColumn,
          metricKey: m.metricKey,
          dataType: m.dataType,
        })),
      };

      let parsedRows: ParsedMetricRow[];

      switch (config.dataCategory) {
        case "LEADS":
          parsedRows = parseLeads(headers, rows, syncConfig);
          break;
        case "AD_METRICS":
        case "SALES":
        case "CUSTOM":
        default:
          parsedRows = parseAdMetrics(headers, rows, syncConfig);
          break;
      }

      // Batch upsert into CachedSheetData
      const batchSize = 100;
      for (let i = 0; i < parsedRows.length; i += batchSize) {
        const batch = parsedRows.slice(i, i + batchSize);
        await Promise.all(
          batch.map((row) =>
            prisma.cachedSheetData.upsert({
              where: {
                clientId_sheetConfigId_dataDate_metricKey: {
                  clientId,
                  sheetConfigId: row.sheetConfigId,
                  dataDate: row.dataDate,
                  metricKey: row.metricKey,
                },
              },
              create: {
                clientId,
                sheetConfigId: row.sheetConfigId,
                dataDate: row.dataDate,
                metricKey: row.metricKey,
                metricValue: row.metricValue,
                rawValue: row.rawValue,
              },
              update: {
                metricValue: row.metricValue,
                rawValue: row.rawValue,
                syncedAt: new Date(),
              },
            })
          )
        );
        result.rowsUpserted += batch.length;
      }

      result.sheetsProcessed++;
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Unknown error";
      result.errors.push(`Sheet "${config.tabName}": ${msg}`);
    }
  }

  return result;
}

/**
 * Sync all active clients.
 */
export async function syncAllClients(): Promise<SyncResult[]> {
  const clients = await prisma.client.findMany({
    where: { isActive: true },
    select: { id: true },
  });

  const results: SyncResult[] = [];
  for (const client of clients) {
    const result = await syncClient(client.id);
    results.push(result);
  }

  return results;
}
