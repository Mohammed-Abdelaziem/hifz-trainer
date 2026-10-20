"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, Lock, Download, Upload, Bell, BellOff } from "lucide-react";
import { MIN_RETENTION, MAX_RETENTION } from "@/lib/srs/fsrs";
import { DAILY_TARGET_MAX, DAILY_TARGET_MIN, DEFAULT_DAILY_TARGET, DEFAULT_RETENTION } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { ThemeSettings } from "@/components/theme/ThemeSettings";
import { useRemindersSetting } from "@/hooks/use-review-reminders";

interface SettingsViewProps {
  user: {
    email: string;
    scheduler: string;
    requestRetention: number;
    dailyTargetCount: number;
  } | null;
  isGuest: boolean;
}

export function SettingsView({ user, isGuest }: SettingsViewProps) {
  const [scheduler, setScheduler] = useState(user?.scheduler ?? "sm2");
  const [retention, setRetention] = useState(user?.requestRetention ?? DEFAULT_RETENTION);
  const [dailyTarget, setDailyTarget] = useState(user?.dailyTargetCount ?? DEFAULT_DAILY_TARGET);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);

  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const reminders = useRemindersSetting();

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
      URL.revokeObjectURL(url);
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
      if (data?.profileApplied) parts.push("settings restored");
      setImportMessage(parts.join(" · "));
    } catch (e: unknown) {
      setImportError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setImporting(false);
    }
  }

  // The "Saved" flashes self-expire on timers; without tracking the handles a
  // save right before unmount would setState on a dead component and leave
  // the timer running.
  const savedTimerRef = useRef<number | undefined>(undefined);
  const pwSavedTimerRef = useRef<number | undefined>(undefined);
  useEffect(() => {
    return () => {
      clearTimeout(savedTimerRef.current);
      clearTimeout(pwSavedTimerRef.current);
    };
  }, []);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    clearTimeout(savedTimerRef.current);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // One call now: the route persists scheduler, retention, and the daily
        // target together, replacing the old two-request save that could leave
        // one field written and the other not.
        body: JSON.stringify({
          scheduler,
          requestRetention: retention,
          dailyTargetCount: dailyTarget,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to save");
      }
      setSaved(true);
      savedTimerRef.current = window.setTimeout(() => setSaved(false), 2000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordChange() {
    setPwSaving(true);
    setPwError(null);
    setPwSaved(false);
    clearTimeout(pwSavedTimerRef.current);
    try {
      const fd = new FormData();
      fd.set("oldPassword", oldPassword);
      fd.set("newPassword", newPassword);
      fd.set("confirmPassword", confirmPassword);
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to change password");
      }
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPwSaved(true);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      pwSavedTimerRef.current = window.setTimeout(() => setPwSaved(false), 3000);
    } catch (e: unknown) {
      setPwError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setPwSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-6">
      <header className="mb-6">
        <Link
          href="/"
          className="mb-2 inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200"
        >
          <ArrowLeft className="h-3 w-3" /> Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Settings</h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          Configure your memorization preferences
        </p>
      </header>

      {isGuest && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-950/40">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            You&apos;re in guest mode. Settings are saved locally and won&apos;t sync.
            {" "}
            <Link href="/login" className="underline hover:text-amber-900 dark:hover:text-amber-100">
              Sign in
            </Link>{" "}
            to persist your preferences.
          </p>
        </div>
      )}

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Appearance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Theme preference is saved on this device and applied before the page loads.
            </p>
            <ThemeSettings />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Spaced Repetition</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
                SRS Algorithm
              </label>
              <p className="mb-3 text-xs text-stone-500 dark:text-stone-400">
                Controls when each verse is scheduled for review. Both work with Sabaq/Sabqi/Manzil.
              </p>
              <div className="flex gap-2">
                <Button
                  variant={scheduler === "sm2" ? "default" : "outline"}
                  onClick={() => setScheduler("sm2")}
                  className="flex-1"
                >
                  SM-2
                  <Badge variant="secondary" className="ml-2">Classic</Badge>
                </Button>
                <Button
                  variant={scheduler === "fsrs" ? "default" : "outline"}
                  onClick={() => setScheduler("fsrs")}
                  className="flex-1"
                >
                  FSRS
                  <Badge variant="success" className="ml-2">Recommended</Badge>
                </Button>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg bg-stone-50 p-2.5 dark:bg-stone-800/50">
                  <p className="font-medium text-stone-700 dark:text-stone-200">SM-2 (Classic)</p>
                  <p className="mt-0.5 text-stone-500 dark:text-stone-400">
                    Simple rules-based system. Predictable intervals. Good for consistent daily routines.
                  </p>
                </div>
                <div className="rounded-lg bg-stone-50 p-2.5 dark:bg-stone-800/50">
                  <p className="font-medium text-stone-700 dark:text-stone-200">FSRS (Recommended)</p>
                  <p className="mt-0.5 text-stone-500 dark:text-stone-400">
                    Uses machine learning to adapt to your memory. Fewer reviews with same retention.
                  </p>
                </div>
              </div>
            </div>

            {scheduler === "fsrs" && (
              <div>
                <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
                  Target Retention: {(retention * 100).toFixed(0)}%
                </label>
                <p className="mb-3 text-xs text-stone-500 dark:text-stone-400">
                  How much of each verse you want to remember at review time. Higher = more frequent reviews.
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-stone-400">{(MIN_RETENTION * 100).toFixed(0)}%</span>
                  <Slider
                    value={[retention]}
                    min={MIN_RETENTION}
                    max={MAX_RETENTION}
                    step={0.01}
                    onValueChange={(v) => setRetention(v[0])}
                    className="flex-1"
                  />
                  <span className="text-xs text-stone-400">{(MAX_RETENTION * 100).toFixed(0)}%</span>
                </div>
                <p className="mt-2 text-center text-sm font-medium text-stone-700 dark:text-stone-300">
                  {(retention * 100).toFixed(0)}%
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Daily Goal</CardTitle>
          </CardHeader>
          <CardContent>
            <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
              Target reviews per day: {dailyTarget}
            </label>
            <p className="mb-3 text-xs text-stone-500 dark:text-stone-400">
              Your dashboard progress ring tracks completion toward this goal.
            </p>
            <div className="flex items-center gap-3">
              <span className="text-xs text-stone-400">{DAILY_TARGET_MIN}</span>
              <Slider
                value={[dailyTarget]}
                min={DAILY_TARGET_MIN}
                max={DAILY_TARGET_MAX}
                step={1}
                onValueChange={(v) => setDailyTarget(v[0])}
                className="flex-1"
              />
              <span className="text-xs text-stone-400">{DAILY_TARGET_MAX}</span>
            </div>
            <p className="mt-2 text-center text-sm font-medium text-stone-700 dark:text-stone-300">
              {dailyTarget} reviews / day
            </p>
          </CardContent>
        </Card>

        {!isGuest && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Review Reminders</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {!reminders.supported ? (
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  This browser does not support notification reminders.
                </p>
              ) : reminders.enabled ? (
                <p className="text-sm text-stone-700 dark:text-stone-300">
                  Reminders are on: this device notifies you about due reviews while the app is
                  open, at most once per day.
                </p>
              ) : reminders.permission === "denied" ? (
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Notifications are blocked for this site. Allow them in the browser&apos;s address
                  bar settings, then return here.
                </p>
              ) : (
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Receive a browser reminder on this device when verses are due, while the app is
                  open.
                </p>
              )}
              {reminders.supported && (
                <Button
                  variant={reminders.enabled ? "outline" : "default"}
                  onClick={() =>
                    reminders.enabled ? reminders.disable() : void reminders.requestPermission()
                  }
                >
                  {reminders.enabled ? (
                    <BellOff className="mr-2 h-4 w-4" />
                  ) : (
                    <Bell className="mr-2 h-4 w-4" />
                  )}
                  {reminders.enabled ? "Disable Reminders" : "Enable Reminders"}
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {!isGuest && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Download every verse you have marked as memorized plus your study settings as
                JSON. Importing a backup restores those verse states and settings; reader
                preferences (masking, reciter) stay on this device.
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
                    // Re-selecting the same file must still fire change.
                    e.target.value = "";
                  }}
                />
              </div>
              {importMessage && (
                <p className="text-sm text-emerald-600 dark:text-emerald-400">{importMessage}</p>
              )}
              {importError && (
                <p className="text-sm text-red-600 dark:text-red-400">{importError}</p>
              )}
            </CardContent>
          </Card>
        )}

        {!isGuest && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
                  Current Password
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-800"
                  autoComplete="current-password"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-800"
                  autoComplete="new-password"
                />
                <p className="mt-1 text-[11px] text-stone-400">
                  12+ chars, at least 3 of: uppercase, lowercase, digit, symbol
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-800"
                  autoComplete="new-password"
                />
              </div>
              {pwError && (
                <p className="text-sm text-red-600 dark:text-red-400">{pwError}</p>
              )}
              {pwSaved && (
                <p className="text-sm text-emerald-600 dark:text-emerald-400">
                  Password changed. You&apos;ve been signed in on this device.
                </p>
              )}
              <Button
                onClick={handlePasswordChange}
                disabled={pwSaving || !oldPassword || !newPassword || !confirmPassword}
                variant="outline"
              >
                {pwSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Lock className="mr-2 h-4 w-4" />
                )}
                Update Password
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-stone-600 dark:text-stone-400">Email</span>
              <span className="text-sm font-medium text-stone-900 dark:text-stone-100">
                {user?.email ?? "Guest"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-stone-600 dark:text-stone-400">Mode</span>
              <Badge variant={isGuest ? "warning" : "success"}>
                {isGuest ? "Guest" : "Authenticated"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        )}

        <Button onClick={handleSave} disabled={saving} className="w-full" size="lg">
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : saved ? (
            "Saved!"
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
