"use client";

/* eslint-disable @next/next/no-img-element -- preview is a local blob URL */

import Link from "next/link";
import { startTransition, useActionState, useEffect, useEffectEvent, useRef, useState } from "react";
import type { FormState } from "@/app/actions";
import { dictionaries, translateError, type Locale } from "@/lib/i18n";
import { resizeImage, resizeImageFromUrl } from "@/lib/resize-image";
import { STATUSES, type Book } from "@/lib/types";

type Props = {
  locale: Locale;
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  book?: Book;
  authors: string[];
  genres: string[];
  cancelHref: string;
};

export function BookForm({ locale, action, book, authors, genres, cancelHref }: Props) {
  const t = dictionaries[locale].form;
  const [state, formAction, pending] = useActionState(action, undefined);
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(
    book?.cover ? `/api/covers/${book.cover}` : null,
  );
  const [removeCover, setRemoveCover] = useState(false);
  const [coverUrl, setCoverUrl] = useState("");
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  /** Resizes the image and puts it into the real file input so it's submitted with the form. */
  async function applyCover(load: () => Promise<File>) {
    setProcessing(true);
    setLocalError(null);
    try {
      const file = await load();
      const dt = new DataTransfer();
      dt.items.add(file);
      if (fileRef.current) fileRef.current.files = dt.files;
      setPreview(URL.createObjectURL(file));
      setRemoveCover(false);
    } catch (err) {
      setLocalError(err instanceof Error ? translateError(locale, err.message) : t.imageFailed);
    } finally {
      setProcessing(false);
    }
  }

  function pickFile(file: File | undefined | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setLocalError(t.chooseImage);
      return;
    }
    setCoverUrl("");
    applyCover(() => resizeImage(file));
  }

  function loadFromUrl() {
    const url = coverUrl.trim();
    if (url) applyCover(() => resizeImageFromUrl(url));
  }

  // Paste an image from the clipboard (Ctrl/Cmd+V)
  const onPaste = useEffectEvent((e: ClipboardEvent) => {
    const file = Array.from(e.clipboardData?.files ?? []).find((f) =>
      f.type.startsWith("image/"),
    );
    if (file) {
      e.preventDefault();
      pickFile(file);
    }
  });
  useEffect(() => {
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, []);

  function clearCover() {
    if (fileRef.current) fileRef.current.value = "";
    setCoverUrl("");
    setPreview(null);
    setRemoveCover(true);
  }

  const error = localError ?? state?.error;

  return (
    <form
      onSubmit={(e) => {
        // Submit manually instead of action={}: React resets the form after an
        // action even when it fails, which would wipe what was typed.
        e.preventDefault();
        if (processing) return;
        const data = new FormData(e.currentTarget);
        startTransition(() => formAction(data));
      }}
      className="grid gap-8 md:grid-cols-[220px_1fr]"
    >
      {/* Cover */}
      <div className="space-y-3">
        <div
          role="button"
          tabIndex={0}
          onClick={() => fileRef.current?.click()}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && fileRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            pickFile(e.dataTransfer.files[0]);
          }}
          className={`relative flex aspect-[2/3] w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition ${
            dragging ? "border-accent bg-accent-soft" : "border-line bg-card hover:border-accent/60"
          }`}
        >
          {preview ? (
            <img src={preview} alt={t.coverPreview} className="h-full w-full object-cover" />
          ) : (
            <div className="p-4 text-center text-sm text-muted">
              <div aria-hidden className="mb-2 text-3xl">🖼️</div>
              {t.dropCover}
            </div>
          )}
          {processing && (
            <div className="absolute inset-0 flex items-center justify-center bg-card/80 text-sm text-muted">
              {t.processing}
            </div>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          name="coverFile"
          accept="image/*"
          className="hidden"
          onChange={(e) => pickFile(e.target.files?.[0])}
        />
        <input type="hidden" name="removeCover" value={removeCover ? "1" : "0"} />
        <div className="flex gap-2">
          <input
            type="url"
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                loadFromUrl();
              }
            }}
            placeholder={t.pasteLink}
            className="field min-w-0 text-xs"
          />
          {coverUrl.trim() && (
            <button type="button" onClick={loadFromUrl} disabled={processing} className="btn-ghost px-3 text-xs">
              {t.use}
            </button>
          )}
        </div>
        {preview && (
          <button type="button" onClick={clearCover} className="text-xs text-muted hover:text-accent">
            {t.removeCover}
          </button>
        )}
      </div>

      {/* Details */}
      <div className="space-y-5">
        <Field label={t.title} required>
          <input
            name="title"
            required
            defaultValue={book?.title}
            autoFocus={!book}
            className="field font-serif text-base"
            placeholder={t.titlePlaceholder}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t.author} required>
            <input
              name="author"
              required
              defaultValue={book?.author}
              list="author-list"
              className="field"
              placeholder={t.authorPlaceholder}
            />
            <datalist id="author-list">
              {authors.map((a) => (
                <option key={a} value={a} />
              ))}
            </datalist>
          </Field>
          <Field label={t.genre}>
            <input
              name="genre"
              defaultValue={book?.genre}
              list="genre-list"
              className="field"
              placeholder={t.genrePlaceholder}
            />
            <datalist id="genre-list">
              {genres.map((g) => (
                <option key={g} value={g} />
              ))}
            </datalist>
          </Field>
        </div>

        <fieldset>
          <legend className="mb-2 text-sm font-medium">{t.status}</legend>
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((s) => (
              <label key={s} className="cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value={s}
                  defaultChecked={(book?.status ?? "to-read") === s}
                  className="peer sr-only"
                />
                <span className="inline-block rounded-full border border-line bg-card px-4 py-1.5 text-sm transition peer-checked:border-accent peer-checked:bg-accent peer-checked:text-accent-ink peer-focus-visible:ring-2 peer-focus-visible:ring-accent/40">
                  {dictionaries[locale].status[s]}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={pending || processing} className="btn-primary">
            {pending ? t.saving : book ? t.save : t.add}
          </button>
          <Link href={cancelHref} className="btn-ghost">
            {t.cancel}
          </Link>
        </div>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">
        {label}
        {required && <span className="text-accent"> *</span>}
      </span>
      {children}
    </label>
  );
}
