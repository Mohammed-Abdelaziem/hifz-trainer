"use client";

import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Download, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BackupCardProps {
  onProfileRestored: (fresh: {
    scheduler?: string;
    requestRetention?: number;
    dailyTargetCount?: number;
  }) => void;
}

export function BackupCard({ onProfileRestored }: BackupCardProps) {
  const queryClient = useQueryClient();
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  async function handleExport() {
    setExporting(true);
    setImportError(null);
    try {
      const res = await fetch("/api/backup");
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Export failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `wholly-quran-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e: unknown) {
      setImportError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setExporting(false);
    }
  }

  async function handleImportFile(file: File) {
    setImporting(true);
    setImportMessage(null);
    setImportError(null);
    try {
      let payload: unknown;
      try {
        payload = JSON.parse(await file.text());
      } catch {
        throw new Error("This file is not valid JSON");
      }
      const res = await fetch("/api/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => null)) as {
        imported?: number;
        skipped?: number;
        profileApplied?: boolean;
        error?: string;
      } | null;
      if (!res.ok) {
        throw new Error(data?.error ?? "Import failed");
      }
      const parts = [`${data?.imported ?? 0} verse states restored`];
      if (data?.skipped) parts.push(`${data.skipped} entries skipped`);
      if (data?.profileApplied) {
        parts.push("settings restored");
        const fresh = await fetch("/api/settings")
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null);
        if (fresh) onProfileRestored(fresh);
      }
      setImportMessage(parts.join(" · "));
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["queue"] }),
        queryClient.invalidateQueries({ queryKey: ["memory-map"] }),
        queryClient.invalidateQueries({ queryKey: ["stats"] }),
        queryClient.invalidateQueries({ queryKey: ["pace"] }),
      ]);
    } catch (e: unknown) {
      setImportError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setImporting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Your Data</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-stone-500 dark:text-stone-400">
          Download every verse you have marked as memorized plus your study settings as JSON.
          Importing a backup restores those verse states and settings; reader preferences (masking,
          reciter) stay on this device.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleExport} disabled={exporting || importing} variant="outline">
            {exporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Export Backup
          </Button>
          <Button
            onClick={() => importInputRef.current?.click()}
            disabled={exporting || importing}
            variant="outline"
          >
            {importing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Import Backup
          </Button>
          <input
            ref={importInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleImportFile(file);
              e.target.value = "";
            }}
          />
        </div>
        {importMessage && (
          <p className="text-sm text-emerald-600 dark:text-emerald-400">{importMessage}</p>
        )}
        {importError && <p className="text-sm text-red-600 dark:text-red-400">{importError}</p>}
      </CardContent>
    </Card>
  );
}
