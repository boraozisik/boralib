import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createBook } from "@/app/actions";
import { BookForm } from "@/components/BookForm";
import { isAdmin } from "@/lib/auth";
import { getFacets } from "@/lib/books";
import { getDict } from "@/lib/locale";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDict();
  return { title: t.form.newTitle };
}

export default function NewBookPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Suspense fallback={<div className="mt-15 h-96 animate-pulse rounded-xl bg-line/40" />}>
        <NewBookForm />
      </Suspense>
    </div>
  );
}

async function NewBookForm() {
  if (!(await isAdmin())) redirect("/admin?next=/books/new");
  const [{ authors, genres }, { locale, t }] = await Promise.all([getFacets(), getDict()]);
  return (
    <>
      <h1 className="font-serif text-3xl font-semibold tracking-tight">{t.form.newTitle}</h1>
      <BookForm locale={locale} action={createBook} authors={authors} genres={genres} cancelHref="/" />
    </>
  );
}
