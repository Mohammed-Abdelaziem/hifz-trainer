import { describe, expect, it } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import {
  useRemindersSetting,
  useDueReviewNotification,
  shouldNotifyToday,
  REMINDERS_TEST_STATE_KEY,
} from "../use-review-reminders";

describe("shouldNotifyToday", () => {
  it("notifies once per UTC day and goes quiet afterwards", () => {
    expect(shouldNotifyToday(undefined, 3, "2026-10-20")).toBe(true);
    expect(shouldNotifyToday("2026-10-20", 3, "2026-10-20")).toBe(false);
    expect(shouldNotifyToday("2026-10-20", 3, "2026-10-21")).toBe(true);
  });

  it("never notifies without due work", () => {
    expect(shouldNotifyToday(undefined, 0, "2026-10-20")).toBe(false);
    expect(shouldNotifyToday(undefined, -2, "2026-10-20")).toBe(false);
    expect(shouldNotifyToday(undefined, Number.NaN, "2026-10-20")).toBe(false);
  });
});

describe("useRemindersSetting", () => {
  it("degrades to unsupported when the browser has no Notification API", async () => {
    // jsdom ships without Notification, which is exactly the path most
    // non-browser environments take; the hook must not crash and must not
    // persist an opt-in the browser cannot honor.
    const { result } = renderHook(() => useRemindersSetting());
    await waitFor(() => expect(result.current.permission).toBe("unsupported"));
    expect(result.current.supported).toBe(false);
    expect(result.current.enabled).toBe(false);

    await result.current.requestPermission();
    const stored = localStorage.getItem(REMINDERS_TEST_STATE_KEY);
    expect(stored).toBeNull();
  });
});

describe("useDueReviewNotification", () => {
  it("stays silent when the opt-in is off", async () => {
    // With jsdom's missing Notification this is also the unsupported path —
    // the contract is: neither branch crashes.
    const hook = renderHook(() => useDueReviewNotification(false, 4));
    await waitFor(() => expect(hook.result.current).toBeUndefined());
  });

  it("stays silent when the opt-in is on but permission is missing", async () => {
    const hook = renderHook(() => useDueReviewNotification(true, 4));
    await waitFor(() => expect(hook.result.current).toBeUndefined());
  });
});
