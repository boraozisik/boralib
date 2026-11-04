import { statusText, type Locale } from "@/lib/i18n";

const STYLES: Record<string, string> = {
  "to-read": "bg-stone-200/70 text-stone-700 dark:bg-stone-700/50 dark:text-stone-200",
  reading: "bg-amber-200/70 text-amber-900 dark:bg-amber-800/50 dark:text-amber-100",
  finished: "bg-emerald-200/70 text-emerald-900 dark:bg-emerald-800/50 dark:text-emerald-100",
};

export function StatusBadge({ status, locale }: { status: string; locale: Locale }) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${STYLES[status] ?? STYLES["to-read"]}`}
    >
      {statusText(locale, status)}
    </span>
  );
}
