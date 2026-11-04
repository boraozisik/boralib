"use client";

import { startTransition, useActionState } from "react";
import { login } from "@/app/actions";
import { dictionaries, type Locale } from "@/lib/i18n";

export function LoginForm({ next, locale }: { next: string; locale: Locale }) {
  const t = dictionaries[locale].admin;
  const [state, formAction, pending] = useActionState(login, undefined);
  return (
    <form
      onSubmit={(e) => {
        // Submit manually so a wrong password doesn't clear the username field.
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => formAction(data));
      }}
      className="mt-6 space-y-4 rounded-xl border border-line bg-card p-5"
    >
      <input type="hidden" name="next" value={next} />
      <label className="block space-y-1.5">
        <span className="text-sm font-medium">{t.username}</span>
        <input name="username" required autoComplete="username" autoFocus className="field" />
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm font-medium">{t.password}</span>
        <input name="password" type="password" required autoComplete="current-password" className="field" />
      </label>
      {state?.error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? t.signingIn : t.signIn}
      </button>
    </form>
  );
}
