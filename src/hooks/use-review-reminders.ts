"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Shared persistence JSON: an object keyed "reminders" and "lastNotifiedOn"
 * so the harness can inspect a single key. LocalStorage because a reminder
 * preference is a per-device, per-browser permission — syncing it is
 * pointless across a phone and a laptop.
 */
const REMINDERS_STORAGE_KEY = "review-reminders-state";
// Exported for the test suite to assert absence without hand-mirroring keys.
export const REMINDERS_TEST_STATE_KEY = "review-reminders-state";

interface RemindersStorage {
  enabled?: boolean;
  lastNotifiedOn?: string;
}

function readStorage(): RemindersStorage {
  try {
    const raw = localStorage.getItem(REMINDERS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as RemindersStorage;
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function writeStorage(next: RemindersStorage) {
  try {
    localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Quota/privacy-mode browsers just don't remember the preference.
  }
}

export type PermissionStatus = "unsupported" | "granted" | "denied" | "default";

function currentPermission(): PermissionStatus {
  if (typeof window === "undefined" || typeof Notification === "undefined") {
    return "unsupported";
  }
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  return "default";
}

interface RemindersSetting {
  supported: boolean;
  permission: PermissionStatus;
  enabled: boolean;
  requestPermission: () => Promise<void>;
  disable: () => void;
}

/**
 * The notification-presence side of review reminders: browser permission plus
 * the opt-in flag. Pure logic (fire rules) lives in shouldNotifyToday so the
 * scheduling rules are unit-testable without a Notification implementation.
 */
export function useRemindersSetting(): RemindersSetting {
  const [permission, setPermission] = useState<PermissionStatus>("unsupported");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot permission+storage hydration snapshot; Notification.permission and localStorage are browser-only and change outside React.
    setPermission(currentPermission());
    setEnabled(readStorage().enabled === true && currentPermission() === "granted");
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof Notification === "undefined") return;
    const result = await Notification.requestPermission();
    setPermission(
      result === "granted"
        ? "granted"
        : result === "denied"
          ? "denied"
          : "default"
    );
    if (result === "granted") {
      setEnabled(true);
      writeStorage({ ...readStorage(), enabled: true });
    }
  }, []);

  const disable = useCallback(() => {
    setEnabled(false);
    writeStorage({ ...readStorage(), enabled: false });
  }, []);

  return {
    supported: permission !== "unsupported",
    permission,
    enabled: permission === "granted" && enabled,
    requestPermission,
    disable,
  };
}

/** Pure fire rule: at most one reminder per UTC day, and only when work exists. */
export function shouldNotifyToday(
  lastNotifiedOn: string | undefined,
  dueCount: number,
  todayUtc: string
): boolean {
  if (!Number.isFinite(dueCount) || dueCount <= 0) return false;
  return lastNotifiedOn !== todayUtc;
}

/**
 * Fires at most one browser notification per UTC day when due reviews are
 * waiting and the user turned reminders on. The dashboard feeding this
 * re-renders every 60s while visible; all firing decisions run through
 * {@link shouldNotifyToday} so repeats dedupe.
 */
export function useDueReviewNotification(enabled: boolean, dueCount: number) {
  useEffect(() => {
    if (!enabled) return;
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    const todayUtc = new Date().toISOString().slice(0, 10);
    const store = readStorage();
    if (!shouldNotifyToday(store.lastNotifiedOn, dueCount, todayUtc)) return;
    try {
      new Notification("Time to review", {
        body: `${dueCount} verse${dueCount === 1 ? " is" : "s are"} waiting for their scheduled review.`,
        tag: "review-due",
      });
      writeStorage({ ...store, lastNotifiedOn: todayUtc });
    } catch {
      // Some engines throw without user activation; retry next cycle.
    }
  }, [enabled, dueCount]);
}
