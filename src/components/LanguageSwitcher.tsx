"use client";

import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";
import { setLocale } from "@/app/actions";
import { dictionaries, type Locale } from "@/lib/i18n";

const OPTIONS: { value: Locale; label: string; Flag: () => React.JSX.Element }[] = [
  { value: "en", label: "EN", Flag: UkFlag },
  { value: "tr", label: "TR", Flag: TrFlag },
];

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  // Keep <html lang> in sync (the root layout is static, so it can't read the cookie).
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <div
      role="group"
      aria-label={dictionaries[locale].language}
      className={`flex shrink-0 rounded-full border border-line bg-card p-0.5 text-xs font-medium transition ${
        pending ? "opacity-60" : ""
      }`}
    >
      {OPTIONS.map(({ value, label, Flag }) => {
        const active = value === locale;
        return (
          <button
            key={value}
            type="button"
            aria-pressed={active}
            disabled={pending || active}
            onClick={() =>
              startTransition(async () => {
                await setLocale(value);
                router.refresh();
              })
            }
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 transition ${
              active ? "bg-accent text-accent-ink" : "text-muted hover:text-ink"
            }`}
          >
            <Flag />
            {label}
          </button>
        );
      })}
    </div>
  );
}

function UkFlag() {
  return (
    <svg aria-hidden viewBox="0 0 60 30" className="h-3 w-[22px] shrink-0 overflow-hidden rounded-[2px]">
      <clipPath id="flag-uk-s">
        <path d="M0,0 v30 h60 v-30 z" />
      </clipPath>
      <clipPath id="flag-uk-t">
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <g clipPath="url(#flag-uk-s)">
        <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
        <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#flag-uk-t)" stroke="#C8102E" strokeWidth="4" />
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  );
}

function TrFlag() {
  return (
    <svg aria-hidden viewBox="0 0 1200 800" className="h-3 w-[18px] shrink-0 rounded-[2px]">
      <rect width="1200" height="800" fill="#E30A17" />
      <circle cx="425" cy="400" r="200" fill="#fff" />
      <circle cx="475" cy="400" r="160" fill="#E30A17" />
      <polygon
        fill="#fff"
        points="583.334,400 764.235,458.779 652.431,304.894 652.431,495.106 764.235,341.221"
      />
    </svg>
  );
}
