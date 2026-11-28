"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PasswordCard({ hasPassword }: { hasPassword: boolean }) {
  const [accountHasPassword, setAccountHasPassword] = useState(hasPassword);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const pwSavedTimerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    return () => clearTimeout(pwSavedTimerRef.current);
  }, []);

  async function handlePasswordChange() {
    setPwSaving(true);
    setPwError(null);
    setPwSaved(false);
    clearTimeout(pwSavedTimerRef.current);
    try {
      const fd = new FormData();
      if (accountHasPassword) fd.set("oldPassword", oldPassword);
      fd.set("newPassword", newPassword);
      fd.set("confirmPassword", confirmPassword);
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to update password");
      }
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAccountHasPassword(true);
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

  const canSubmit =
    !pwSaving &&
    Boolean(newPassword) &&
    Boolean(confirmPassword) &&
    (!accountHasPassword || Boolean(oldPassword));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lock className="h-4 w-4" />
          {accountHasPassword ? "Change Password" : "Set Password"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handlePasswordChange();
          }}
          className="space-y-4"
        >
          {accountHasPassword ? (
            <div>
              <label
                htmlFor="pw-old"
                className="text-sm font-medium text-stone-700 dark:text-stone-300"
              >
                Current Password
              </label>
              <input
                id="pw-old"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-800"
                autoComplete="current-password"
              />
            </div>
          ) : (
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Your account currently signs in with a social provider. Set a password if you also
              want to sign in with email and password.
            </p>
          )}
          <div>
            <label
              htmlFor="pw-new"
              className="text-sm font-medium text-stone-700 dark:text-stone-300"
            >
              New Password
            </label>
            <input
              id="pw-new"
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
            <label
              htmlFor="pw-confirm"
              className="text-sm font-medium text-stone-700 dark:text-stone-300"
            >
              Confirm New Password
            </label>
            <input
              id="pw-confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-800"
              autoComplete="new-password"
            />
          </div>
          {pwError && <p className="text-sm text-red-600 dark:text-red-400">{pwError}</p>}
          {pwSaved && (
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              Password saved. You&apos;ve been signed in on this device.
            </p>
          )}
          <Button type="submit" disabled={!canSubmit} variant="outline">
            {pwSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Lock className="mr-2 h-4 w-4" />
            )}
            {accountHasPassword ? "Update Password" : "Set Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
