"use client";

import { useTransition } from "react";
import { deleteBook, setBookStatus } from "@/app/actions";
import { dictionaries, type Locale } from "@/lib/i18n";
import { STATUSES, type Status } from "@/lib/types";

export function StatusSwitcher({ id, status, locale }: { id: number; status: Status; locale: Locale }) {
  const [pending, startTransition] = useTransition();
  return (
    <div className={`flex flex-wrap gap-1.5 ${pending ? "opacity-60" : ""}`}>
      {STATUSES.map((s) => (
        <button
          key={s}
          type="button"
          disabled={pending}
          onClick={() => startTransition(() => setBookStatus(id, s))}
          className={`rounded-full border px-3 py-1 text-xs transition ${
            status === s
              ? "border-accent bg-accent text-accent-ink"
              : "border-line bg-card text-muted hover:border-accent/50 hover:text-ink"
          }`}
        >
          {dictionaries[locale].status[s]}
        </button>
      ))}
    </div>
  );
}

export function DeleteBookButton({ id, title, locale }: { id: number; title: string; locale: Locale }) {
  const t = dictionaries[locale].book;
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      className="btn-danger"
      onClick={() => {
        if (confirm(t.confirmDelete(title))) {
          startTransition(() => deleteBook(id));
        }
      }}
    >
      {pending ? t.deleting : t.delete}
    </button>
  );
}
