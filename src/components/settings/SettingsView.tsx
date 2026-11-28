"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { MIN_RETENTION, MAX_RETENTION } from "@/lib/srs/fsrs";
import {
  DAILY_TARGET_MAX,
  DAILY_TARGET_MIN,
  DEFAULT_DAILY_TARGET,
  DEFAULT_RETENTION,
} from "@/lib/constants";
import { useUpdateSettingsMutation } from "@/hooks/use-srs-mutations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { ThemeSettings } from "@/components/theme/ThemeSettings";
import { BackupCard } from "./BackupCard";
import { PasswordCard } from "./PasswordCard";
import { RemindersCard } from "./RemindersCard";

interface SettingsViewProps {
  user: {
    email: string;
    scheduler: string;
    requestRetention: number;
    dailyTargetCount: number;
    hasPassword?: boolean;
  } | null;
  isGuest: boolean;
}

export function SettingsView({ user, isGuest }: SettingsViewProps) {
  const updateSettings = useUpdateSettingsMutation();
  const [scheduler, setScheduler] = useState(user?.scheduler ?? "sm2");
  const [retention, setRetention] = useState(user?.requestRetention ?? DEFAULT_RETENTION);
  const [dailyTarget, setDailyTarget] = useState(user?.dailyTargetCount ?? DEFAULT_DAILY_TARGET);
  const [saved, setSaved] = useState(false);

  const savedTimerRef = useRef<number | undefined>(undefined);
  useEffect(() => {
    return () => clearTimeout(savedTimerRef.current);
  }, []);

  async function handleSave() {
    setSaved(false);
    clearTimeout(savedTimerRef.current);
    try {
      await updateSettings.mutateAsync({
        scheduler,
        requestRetention: retention,
        dailyTargetCount: dailyTarget,
      });
      setSaved(true);
      savedTimerRef.current = window.setTimeout(() => setSaved(false), 2000);
    } catch {
      // Error surfaced via updateSettings.error
    }
  }

  const saving = updateSettings.isPending;
  const error = updateSettings.error instanceof Error ? updateSettings.error.message : null;

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
            You&apos;re in guest mode. Settings are saved locally and won&apos;t sync.{" "}
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
                  <Badge variant="secondary" className="ml-2">
                    Classic
                  </Badge>
                </Button>
                <Button
                  variant={scheduler === "fsrs" ? "default" : "outline"}
                  onClick={() => setScheduler("fsrs")}
                  className="flex-1"
                >
                  FSRS
                  <Badge variant="success" className="ml-2">
                    Recommended
                  </Badge>
                </Button>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg bg-stone-50 p-2.5 dark:bg-stone-800/50">
                  <p className="font-medium text-stone-700 dark:text-stone-200">SM-2 (Classic)</p>
                  <p className="mt-0.5 text-stone-500 dark:text-stone-400">
                    Simple rules-based system. Predictable intervals. Good for consistent daily
                    routines.
                  </p>
                </div>
                <div className="rounded-lg bg-stone-50 p-2.5 dark:bg-stone-800/50">
                  <p className="font-medium text-stone-700 dark:text-stone-200">
                    FSRS (Recommended)
                  </p>
                  <p className="mt-0.5 text-stone-500 dark:text-stone-400">
                    Uses machine learning to adapt to your memory. Fewer reviews with same
                    retention.
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
                  How much of each verse you want to remember at review time. Higher = more frequent
                  reviews.
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-stone-400">
                    {(MIN_RETENTION * 100).toFixed(0)}%
                  </span>
                  <Slider
                    value={[retention]}
                    min={MIN_RETENTION}
                    max={MAX_RETENTION}
                    step={0.01}
                    onValueChange={(v) => setRetention(v[0])}
                    className="flex-1"
                  />
                  <span className="text-xs text-stone-400">
                    {(MAX_RETENTION * 100).toFixed(0)}%
                  </span>
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

        {!isGuest && <RemindersCard />}

        {!isGuest && (
          <BackupCard
            onProfileRestored={(fresh) => {
              if (typeof fresh.scheduler === "string") setScheduler(fresh.scheduler);
              if (typeof fresh.requestRetention === "number") setRetention(fresh.requestRetention);
              if (typeof fresh.dailyTargetCount === "number")
                setDailyTarget(fresh.dailyTargetCount);
            }}
          />
        )}

        {!isGuest && <PasswordCard hasPassword={user?.hasPassword ?? true} />}

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

        <Button onClick={handleSave} disabled={saving || isGuest} className="w-full" size="lg">
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
