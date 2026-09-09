"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { MIN_RETENTION, MAX_RETENTION } from "@/lib/srs/fsrs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

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
  const [retention, setRetention] = useState(user?.requestRetention ?? 0.9);
  const [dailyTarget, setDailyTarget] = useState(user?.dailyTargetCount ?? 10);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduler, requestRetention: retention }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to save");
      }
      if (dailyTarget !== (user?.dailyTargetCount ?? 10)) {
        await fetch("/api/settings/target", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dailyTargetCount: dailyTarget }),
        });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSaving(false);
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
              <span className="text-xs text-stone-400">5</span>
              <Slider
                value={[dailyTarget]}
                min={5}
                max={50}
                step={1}
                onValueChange={(v) => setDailyTarget(v[0])}
                className="flex-1"
              />
              <span className="text-xs text-stone-400">50</span>
            </div>
            <p className="mt-2 text-center text-sm font-medium text-stone-700 dark:text-stone-300">
              {dailyTarget} reviews / day
            </p>
          </CardContent>
        </Card>

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
