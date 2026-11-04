"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { saveNotes } from "@/app/actions";
import { dictionaries, type Locale } from "@/lib/i18n";

type SaveState = "saved" | "dirty" | "saving" | "error";

/** Formats an SQLite "YYYY-MM-DD HH:MM:SS" (UTC) or ISO timestamp for display. */
function formatSavedAt(value: string | null, dateLocale: string) {
  if (!value) return null;
  const d = new Date(value.includes("T") ? value : value.replace(" ", "T") + "Z");
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString(dateLocale, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function NotesEditor({
  locale,
  bookId,
  initialNotes,
  notesUpdatedAt,
}: {
  locale: Locale;
  bookId: number;
  initialNotes: string;
  notesUpdatedAt: string | null;
}) {
  const t = dictionaries[locale];
  const [text, setText] = useState(initialNotes);
  const [mode, setMode] = useState<"write" | "read">(initialNotes.trim() ? "read" : "write");
  const [focus, setFocus] = useState(false);
  const [state, setState] = useState<SaveState>("saved");
  const [savedAt, setSavedAt] = useState(notesUpdatedAt);
  const savedText = useRef(initialNotes);
  const latestText = useRef(initialNotes);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const save = useCallback(
    async (value: string) => {
      if (value === savedText.current) {
        setState("saved");
        return;
      }
      setState("saving");
      try {
        const res = await saveNotes(bookId, value);
        savedText.current = value;
        setSavedAt(res.savedAt);
        setState(latestText.current === value ? "saved" : "dirty");
      } catch {
        setState("error");
      }
    },
    [bookId],
  );

  // Autosave 1 second after typing stops.
  useEffect(() => {
    latestText.current = text;
    if (text === savedText.current) return;
    setState((s) => (s === "saving" ? s : "dirty"));
    const t = setTimeout(() => save(text), 1000);
    return () => clearTimeout(t);
  }, [text, save]);

  // Warn before leaving the page with unsaved changes.
  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (latestText.current !== savedText.current) e.preventDefault();
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  // Esc leaves focus mode.
  useEffect(() => {
    if (!focus) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setFocus(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [focus]);

  // Grow the textarea with its content; the page (or focus panel) scrolls.
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const min = window.innerHeight * (focus ? 0.75 : 0.6);
    el.style.height = `${Math.max(el.scrollHeight, min)}px`;
  }, [text, mode, focus]);

  /** Adds Markdown to the start of the selected lines, or around the selection. */
  function insert(kind: "heading" | "quote" | "list" | "bold" | "date") {
    const el = textareaRef.current;
    if (!el) return;
    const { selectionStart: start, selectionEnd: end, value } = el;
    let next = value;
    let cursor = end;

    if (kind === "bold") {
      const sel = value.slice(start, end) || t.notes.boldText;
      next = value.slice(0, start) + `**${sel}**` + value.slice(end);
      cursor = start + sel.length + 4;
    } else if (kind === "date") {
      const today = new Date().toLocaleDateString(t.dateLocale, { month: "long", day: "numeric", year: "numeric" });
      const prefix = start > 0 && value[start - 1] !== "\n" ? "\n\n" : "";
      const chunk = `${prefix}### ${today}\n`;
      next = value.slice(0, start) + chunk + value.slice(end);
      cursor = start + chunk.length;
    } else {
      const mark = kind === "heading" ? "## " : kind === "quote" ? "> " : "- ";
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      const block = value.slice(lineStart, end);
      const marked = block
        .split("\n")
        .map((line) => mark + line)
        .join("\n");
      next = value.slice(0, lineStart) + marked + value.slice(end);
      cursor = lineStart + marked.length;
    }

    setText(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(cursor, cursor);
    });
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
      e.preventDefault();
      save(text);
    }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
      e.preventDefault();
      insert("bold");
    }
  }

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const savedLabel = formatSavedAt(savedAt, t.dateLocale);

  const statusText = {
    saved: savedLabel ? t.notes.saved(savedLabel) : t.notes.noNotes,
    dirty: t.notes.unsaved,
    saving: t.notes.saving,
    error: t.notes.error,
  }[state];

  return (
    <section
      className={
        focus
          ? "fixed inset-0 z-50 flex flex-col bg-paper"
          : "flex flex-col rounded-xl border border-line bg-card shadow-sm"
      }
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-3 py-2 sm:px-4">
        <div className="flex rounded-lg border border-line p-0.5 text-sm">
          {(["write", "read"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`rounded-md px-3 py-1 transition ${
                mode === m ? "bg-accent text-accent-ink" : "text-muted hover:text-ink"
              }`}
            >
              {m === "write" ? t.notes.write : t.notes.read}
            </button>
          ))}
        </div>

        {mode === "write" && (
          <div className="flex items-center gap-0.5 text-sm text-muted">
            <ToolButton title={t.notes.heading} onClick={() => insert("heading")}>
              H
            </ToolButton>
            <ToolButton title={t.notes.bold} onClick={() => insert("bold")}>
              <b>B</b>
            </ToolButton>
            <ToolButton title={t.notes.quote} onClick={() => insert("quote")}>
              ❝
            </ToolButton>
            <ToolButton title={t.notes.list} onClick={() => insert("list")}>
              •
            </ToolButton>
            <ToolButton title={t.notes.date} onClick={() => insert("date")}>
              📅
            </ToolButton>
          </div>
        )}

        <div className="ml-auto flex items-center gap-3 text-xs text-muted">
          <span className="hidden sm:inline">{t.notes.words(words)}</span>
          <span
            className={
              state === "error" ? "text-red-600" : state === "saved" ? "" : "text-accent"
            }
          >
            {statusText}
          </span>
          <button
            type="button"
            onClick={() => setFocus((f) => !f)}
            title={focus ? t.notes.exitFocus : t.notes.focusTitle}
            className="rounded-md border border-line px-2 py-1 text-ink hover:border-accent/50"
          >
            {focus ? t.notes.close : t.notes.focus}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={focus ? "flex-1 overflow-y-auto" : ""}>
        <div className={focus ? "mx-auto max-w-3xl px-6 py-10" : "px-4 py-4 sm:px-6 sm:py-5"}>
          {mode === "write" ? (
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={onKeyDown}
              onBlur={() => save(text)}
              autoFocus={!initialNotes.trim()}
              placeholder={t.notes.placeholder}
              className="block w-full resize-none overflow-hidden bg-transparent font-serif text-[17px] leading-8 text-ink outline-none placeholder:text-muted/60"
            />
          ) : text.trim() ? (
            <article className="prose prose-stone max-w-none font-serif prose-headings:font-serif prose-blockquote:border-accent prose-blockquote:text-ink/80 dark:prose-invert">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
            </article>
          ) : (
            <div className="py-16 text-center text-muted">
              {t.notes.empty}{" "}
              <button type="button" onClick={() => setMode("write")} className="text-accent hover:underline">
                {t.notes.start}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ToolButton({
  title,
  onClick,
  children,
}: {
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onMouseDown={(e) => e.preventDefault()} // keep the textarea selection
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent-soft hover:text-ink"
    >
      {children}
    </button>
  );
}
