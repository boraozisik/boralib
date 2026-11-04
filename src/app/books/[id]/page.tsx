import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BookCover } from "@/components/BookCover";
import { DeleteBookButton, StatusSwitcher } from "@/components/BookActions";
import { NotesEditor } from "@/components/NotesEditor";
import { StatusBadge } from "@/components/StatusBadge";
import { isAdmin } from "@/lib/auth";
import { getBook } from "@/lib/books";
import { genreLabel, type Dict, type Locale } from "@/lib/i18n";
import { getDict } from "@/lib/locale";
import type { Book } from "@/lib/types";

export async function generateMetadata({ params }: PageProps<"/books/[id]">): Promise<Metadata> {
  const id = Number((await params).id);
  const [book, { t }] = await Promise.all([Number.isInteger(id) ? getBook(id) : undefined, getDict()]);
  return { title: book ? book.title : t.book.notFound };
}

export default function BookPage({ params }: PageProps<"/books/[id]">) {
  return (
    <Suspense fallback={<BookSkeleton />}>
      <BookDetail params={params} />
    </Suspense>
  );
}

async function BookDetail({ params }: { params: PageProps<"/books/[id]">["params"] }) {
  const id = Number((await params).id);
  const [book, admin, { locale, t }] = await Promise.all([
    Number.isInteger(id) ? getBook(id) : undefined,
    isAdmin(),
    getDict(),
  ]);
  if (!book) notFound();

  return (
    <div className="space-y-6">
      <Link href="/" className="inline-block text-sm text-muted hover:text-accent">
        {t.book.back}
      </Link>
      {admin ? (
        <AdminView book={book} locale={locale} t={t} />
      ) : (
        <PublicView book={book} locale={locale} t={t} />
      )}
    </div>
  );
}

/** What visitors see: the book only. Notes are private and never sent to the browser. */
type ViewProps = { book: Book; locale: Locale; t: Dict };

function PublicView({ book, locale, t }: ViewProps) {
  return (
    <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
      <div className="mx-auto w-48 shrink-0 sm:mx-0 sm:w-60">
        <BookCover {...book} alt={t.book.coverOf(book.title)} className="shadow-xl" />
      </div>
      <div className="space-y-3 text-center sm:pt-2 sm:text-left">
        <h1 className="font-serif text-3xl leading-tight font-semibold">{book.title}</h1>
        <Link
          href={`/?author=${encodeURIComponent(book.author)}`}
          className="block text-lg text-muted hover:text-accent"
        >
          {book.author}
        </Link>
        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          <StatusBadge status={book.status} locale={locale} />
          {book.genre && <GenreLink genre={book.genre} locale={locale} />}
        </div>
      </div>
    </div>
  );
}

/** What the admin sees: book controls plus the private notes editor. */
function AdminView({ book, locale, t }: ViewProps) {
  return (
    <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
      <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
        <div className="mx-auto w-44 sm:w-52 lg:w-full">
          <BookCover {...book} alt={t.book.coverOf(book.title)} className="shadow-xl" />
        </div>
        <div className="space-y-1.5">
          <h1 className="font-serif text-2xl leading-tight font-semibold">{book.title}</h1>
          <Link
            href={`/?author=${encodeURIComponent(book.author)}`}
            className="block text-muted hover:text-accent"
          >
            {book.author}
          </Link>
          {book.genre && <GenreLink genre={book.genre} locale={locale} />}
        </div>
        <StatusSwitcher id={book.id} status={book.status} locale={locale} />
        <div className="flex gap-2">
          <Link href={`/books/${book.id}/edit`} className="btn-ghost">
            {t.book.edit}
          </Link>
          <DeleteBookButton id={book.id} title={book.title} locale={locale} />
        </div>
      </aside>

      <div className="min-w-0 space-y-3">
        <div className="flex items-baseline gap-2">
          <h2 className="font-serif text-xl font-semibold">{t.book.myNotes}</h2>
          <span className="text-xs text-muted">{t.book.onlyYou}</span>
        </div>
        <NotesEditor
          locale={locale}
          bookId={book.id}
          initialNotes={book.notes}
          notesUpdatedAt={book.notes_updated_at}
        />
      </div>
    </div>
  );
}

function GenreLink({ genre, locale }: { genre: string; locale: Locale }) {
  return (
    <Link
      href={`/?genre=${encodeURIComponent(genre)}`}
      className="inline-block rounded-full bg-accent-soft px-2.5 py-0.5 text-xs text-ink hover:text-accent"
    >
      {genreLabel(locale, genre)}
    </Link>
  );
}

function BookSkeleton() {
  return (
    <div className="grid gap-8 pt-10 lg:grid-cols-[260px_1fr]">
      <div className="aspect-[2/3] animate-pulse rounded-md bg-line/50" />
      <div className="h-[60vh] animate-pulse rounded-xl bg-line/40" />
    </div>
  );
}
