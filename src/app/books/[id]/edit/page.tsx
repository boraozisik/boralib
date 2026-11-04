import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { updateBook } from "@/app/actions";
import { BookForm } from "@/components/BookForm";
import { isAdmin } from "@/lib/auth";
import { getBook, getFacets } from "@/lib/books";
import { getDict } from "@/lib/locale";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDict();
  return { title: t.form.editTitle };
}

export default function EditBookPage({ params }: PageProps<"/books/[id]/edit">) {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Suspense fallback={<div className="mt-15 h-96 animate-pulse rounded-xl bg-line/40" />}>
        <EditBookForm params={params} />
      </Suspense>
    </div>
  );
}

async function EditBookForm({ params }: { params: PageProps<"/books/[id]/edit">["params"] }) {
  const id = Number((await params).id);
  if (!(await isAdmin())) redirect(`/admin?next=/books/${id}/edit`);
  const [book, { authors, genres }, { locale, t }] = await Promise.all([
    Number.isInteger(id) ? getBook(id) : undefined,
    getFacets(),
    getDict(),
  ]);
  if (!book) notFound();

  return (
    <>
      <h1 className="font-serif text-3xl font-semibold tracking-tight">{t.form.editTitle}</h1>
      <BookForm
        locale={locale}
        action={updateBook.bind(null, book.id)}
        book={book}
        authors={authors}
        genres={genres}
        cancelHref={`/books/${book.id}`}
      />
    </>
  );
}
