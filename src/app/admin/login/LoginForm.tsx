"use client";

import { startTransition, useActionState, useState } from "react";
import { signIn } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(signIn, undefined);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => action(data));
      }}
      className="mt-8 space-y-5"
    >
      <div>
        <label htmlFor="username" className="eyebrow mb-2 block text-muted">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          required
          className="field"
        />
      </div>
      <div>
        <label htmlFor="password" className="eyebrow mb-2 block text-muted">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            className="field pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            title={showPassword ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 grid w-12 place-items-center rounded-r-xl text-muted transition hover:text-gold-deep focus-visible:text-gold-deep focus-visible:outline-none"
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
      </div>

      {state?.error && (
        <p role="alert" className="rounded-xl bg-rose/10 px-4 py-3 text-sm text-rose">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="eyebrow w-full rounded-full bg-forest py-4 text-paper transition hover:bg-forest-2 disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign In"}
      </button>
    </form>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12s3.75-7.5 9.75-7.5 9.75 7.5 9.75 7.5-3.75 7.5-9.75 7.5S2.25 12 2.25 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.98 8.22A10.48 10.48 0 0 0 2.25 12s3.75 7.5 9.75 7.5c1.6 0 3.06-.53 4.33-1.3M9.88 4.73A9.1 9.1 0 0 1 12 4.5c6 0 9.75 7.5 9.75 7.5a17.4 17.4 0 0 1-2.4 3.4M14.12 14.12a3 3 0 1 1-4.24-4.24M3 3l18 18"
      />
    </svg>
  );
}
