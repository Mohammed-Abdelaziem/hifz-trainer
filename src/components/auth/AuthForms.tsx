"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import {
  signInAction,
  signUpAction,
  demoSignInAction,
  type AuthState,
} from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      {label}
    </Button>
  );
}

function Field({
  name,
  type,
  label,
  placeholder,
}: {
  name: string;
  type: string;
  label: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-stone-600 dark:text-stone-300">
        {label}
      </span>
      <input
        name={name}
        type={type}
        required
        autoComplete={name === "email" ? "email" : type === "password" ? "new-password" : undefined}
        placeholder={placeholder}
        className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20 dark:border-stone-600 dark:bg-stone-900"
      />
    </label>
  );
}

export function AuthForms() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [signInState, signIn] = useActionState<AuthState, FormData>(signInAction, {});
  const [signUpState, signUp] = useActionState<AuthState, FormData>(signUpAction, {});
  const state = mode === "signin" ? signInState : signUpState;

  return (
    <div className="w-full max-w-sm">
      <div className="mb-5 inline-flex w-full rounded-lg border border-stone-200 bg-stone-100 p-0.5 dark:border-stone-700 dark:bg-stone-800">
        {(
          [
            ["signin", "Sign in"],
            ["signup", "Create account"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setMode(key)}
            aria-selected={mode === key}
            role="tab"
            className={cn(
              "flex-1 cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              mode === key
                ? "bg-white text-stone-900 shadow-sm dark:bg-stone-950 dark:text-amber-400"
                : "text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <form
        key={mode}
        action={mode === "signin" ? signIn : signUp}
        className="space-y-4 rounded-xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900"
      >
        <Field name="email" type="email" label="Email" placeholder="you@example.com" />
        <Field name="password" type="password" label="Password" placeholder="min 8 characters" />
        {state?.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300">
            {state.error}
          </p>
        )}
        <SubmitButton label={mode === "signin" ? "Sign in" : "Create account & start"} />
      </form>

      <div className="my-4 flex items-center gap-3 text-xs text-stone-400">
        <span className="h-px flex-1 bg-stone-200 dark:bg-stone-700" />
        or
        <span className="h-px flex-1 bg-stone-200 dark:bg-stone-700" />
      </div>

      <form action={demoSignInAction}>
        <Button type="submit" variant="outline" className="w-full">
          Continue with demo account
        </Button>
      </form>
      <p className="mt-2 text-center text-[11px] text-stone-400">
        Demo account (demo@hifz.local) keeps shared sample progress.
      </p>
    </div>
  );
}
