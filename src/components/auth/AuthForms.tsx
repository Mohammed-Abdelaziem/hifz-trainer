"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import {
  signInAction,
  signUpAction,
  guestSignInAction,
  googleSignInAction,
  githubSignInAction,
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

function OAuthButton({
  action,
  label,
  icon,
}: {
  action: () => Promise<void>;
  label: string;
  icon: React.ReactNode;
}) {
  const { pending } = useFormStatus();
  return (
    <form action={action}>
      <Button type="submit" variant="outline" disabled={pending} className="w-full gap-2">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
        {label}
      </Button>
    </form>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
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

      {/* OAuth buttons */}
      <div className="space-y-3">
        <OAuthButton action={googleSignInAction} label="Continue with Google" icon={<GoogleIcon />} />
        <OAuthButton action={githubSignInAction} label="Continue with GitHub" icon={<GitHubIcon />} />
      </div>

      <div className="my-4 flex items-center gap-3 text-xs text-stone-400">
        <span className="h-px flex-1 bg-stone-200 dark:bg-stone-700" />
        or continue with email
        <span className="h-px flex-1 bg-stone-200 dark:bg-stone-700" />
      </div>

      <form
        key={mode}
        action={mode === "signin" ? signIn : signUp}
        className="space-y-4 rounded-xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900"
      >
        <Field name="email" type="email" label="Email" placeholder="you@example.com" />
        <Field name="password" type="password" label="Password" placeholder="min 12 characters" />
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

      <form action={guestSignInAction}>
        <Button type="submit" variant="outline" className="w-full">
          Continue without account
        </Button>
      </form>
      <p className="mt-2 text-center text-[11px] text-stone-400">
        Your progress stays on this device. No account needed.
      </p>
    </div>
  );
}
