"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { dictionaries, genreLabel, type Locale } from "@/lib/i18n";
import { SORTS, STATUSES, type BookFilters } from "@/lib/types";

type Props = {
  locale: Locale;
  current: BookFilters;
  /** The "Recently noted" sort is only offered to the admin (notes are private). */
  showNotesSort: boolean;
  authors: string[];
  genres: string[];
  statusCounts: Record<string, number>;
  total: number;
};

export function Filters({ locale, current, showNotesSort, authors, genres, statusCounts, total }: Props) {
  const t = dictionaries[locale];
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(current.q ?? "");
  const firstRender = useRef(true);

  function apply(patch: Partial<BookFilters>) {
    const next = { ...current, q, ...patch };
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value);
    }
    const qs = params.toString();
    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  }

  // Search box: update the URL once typing pauses (300ms).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const t = setTimeout(() => apply({ q }), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const hasFilters = Boolean(current.q || current.author || current.genre || current.status);

  const tabs = [{ value: "", label: t.filters.all, count: total }].concat(
    STATUSES.map((s) => ({ value: s, label: t.status[s], count: statusCounts[s] ?? 0 })),
  );

  return (
    <div className={`space-y-4 transition-opacity ${pending ? "opacity-70" : ""}`}>
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const active = (current.status ?? "") === tab.value;
          return (
            <button
              key={tab.value || "all"}
              type="button"
              onClick={() => apply({ status: tab.value })}
              className={`rounded-full border px-3 py-1 text-sm transition ${
                active
                  ? "border-accent bg-accent text-accent-ink"
                  : "border-line bg-card text-ink hover:border-accent/50"
              }`}
            >
              {tab.label}
              <span className={`ml-1.5 text-xs ${active ? "opacity-80" : "text-muted"}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
        <label className="relative block">
          <span className="sr-only">{t.filters.search}</span>
          <span aria-hidden className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted">
            ⌕
          </span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.filters.searchPlaceholder}
            className="field pl-8"
          />
        </label>
        <Select
          label={t.filters.author}
          value={current.author ?? ""}
          options={authors}
          onChange={(author) => apply({ author })}
          allLabel={t.filters.allAuthors}
        />
        <Select
          label={t.filters.genre}
          value={current.genre ?? ""}
          options={[...genres].sort((x, y) => genreLabel(locale, x).localeCompare(genreLabel(locale, y), locale))}
          optionLabel={(g) => genreLabel(locale, g)}
          onChange={(genre) => apply({ genre })}
          allLabel={t.filters.allGenres}
        />
        <label className="block">
          <span className="sr-only">{t.filters.sortBy}</span>
          <select
            value={current.sort ?? "recent"}
            onChange={(e) => apply({ sort: e.target.value === "recent" ? "" : e.target.value })}
            className="field"
          >
            {SORTS.filter((s) => showNotesSort || s !== "notes").map((s) => (
              <option key={s} value={s}>
                {t.sorts[s]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={() => {
            setQ("");
            apply({ q: "", author: "", genre: "", status: "" });
          }}
          className="text-sm text-accent underline-offset-4 hover:underline"
        >
          {t.filters.clear}
        </button>
      )}
    </div>
  );
}

function Select({
  label,
  value,
  options,
  optionLabel = (o) => o,
  onChange,
  allLabel,
}: {
  label: string;
  value: string;
  options: string[];
  optionLabel?: (o: string) => string;
  onChange: (v: string) => void;
  allLabel: string;
}) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="field">
        <option value="">{allLabel}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {optionLabel(o)}
          </option>
        ))}
      </select>
    </label>
  );
}
