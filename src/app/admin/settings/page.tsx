export default function SettingsPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Global application settings and configuration.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
        <h3 className="font-semibold">Google Sheets Integration</h3>
        <p className="text-sm text-muted-foreground">
          To connect Google Sheets, you need a Google Cloud Service Account.
          The service account email must be given Viewer access to each Google Sheet.
        </p>
        <div className="space-y-2">
          <p className="text-sm">
            <span className="font-medium">Service Account:</span>{" "}
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
              {process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || "Not configured"}
            </code>
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
        <h3 className="font-semibold">Data Sync</h3>
        <p className="text-sm text-muted-foreground">
          Data is automatically synced from Google Sheets on a schedule.
          You can also trigger a manual sync from each client&apos;s data sources page.
        </p>
        <div className="space-y-2">
          <p className="text-sm">
            <span className="font-medium">Sync Schedule:</span>{" "}
            Every 30 minutes (via Vercel Cron)
          </p>
          <p className="text-sm">
            <span className="font-medium">Cron Endpoint:</span>{" "}
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
              /api/cron/sync
            </code>
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
        <h3 className="font-semibold">Environment Variables</h3>
        <p className="text-sm text-muted-foreground">
          Required environment variables for this application:
        </p>
        <ul className="text-sm space-y-1">
          <li>
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">DATABASE_URL</code>
            {" "}- PostgreSQL connection string
          </li>
          <li>
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">NEXTAUTH_SECRET</code>
            {" "}- Random secret for session encryption
          </li>
          <li>
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">NEXTAUTH_URL</code>
            {" "}- Your app&apos;s URL
          </li>
          <li>
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">GOOGLE_SERVICE_ACCOUNT_EMAIL</code>
            {" "}- Service account email
          </li>
          <li>
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">GOOGLE_PRIVATE_KEY</code>
            {" "}- Service account private key
          </li>
          <li>
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">CRON_SECRET</code>
            {" "}- Secret for cron job authentication
          </li>
        </ul>
      </div>
    </div>
  );
}
