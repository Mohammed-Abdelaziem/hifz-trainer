"use client";

import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRemindersSetting } from "@/hooks/use-review-reminders";

export function RemindersCard() {
  const reminders = useRemindersSetting();

  return (
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
            Reminders are on: this device notifies you about due reviews while the app is open, at
            most once per day.
          </p>
        ) : reminders.permission === "denied" ? (
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Notifications are blocked for this site. Allow them in the browser&apos;s address bar
            settings, then return here.
          </p>
        ) : (
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Receive a browser reminder on this device when verses are due, while the app is open.
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
  );
}
