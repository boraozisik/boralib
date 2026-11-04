import Link from "next/link";
import { Suspense } from "react";
import { BookCover } from "@/components/BookCover";
import { Filters } from "@/components/Filters";
import { StatusBadge } from "@/components/StatusBadge";
import { isAdmin } from "@/lib/auth";
import { getBooks, getFacets } from "@/lib/books";
import { genreLabel, type Dict } from "@/lib/i18n";
import { getDict } from "@/lib/locale";
import type { BookFilters } from "@/lib/types";

export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <Suspense fallback={<LibrarySkeleton />}>
      <Library searchParams={searchParams} />
    </Suspense>
  );
}

async function Library({ searchParams }: { searchParams: PageProps<"/">["searchParams"] }) {
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;
  const filters: BookFilters = {
    q: one(sp.q),
    author: one(sp.author),
    genre: one(sp.genre),
    status: one(sp.status),
    sort: one(sp.sort),
  };

  const [admin, { locale, t }] = await Promise.all([isAdmin(), getDict()]);
  // Notes are private: visitors can't sort by when notes were written.
  if (!admin && filters.sort === "notes") filters.sort = undefined;
  const [books, facets] = await Promise.all([getBooks(filters), getFacets()]);

  if (facets.total === 0) return <EmptyLibrary admin={admin} t={t} />;

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="font-serif text-3xl font-semibold tracking-tight">{t.home.title}</h1>
        <p className="text-sm text-muted">
          {books.length === facets.total
            ? t.home.count(facets.total)
            : t.home.showing(books.length, facets.total)}
        </p>
      </div>

      <Filters
        locale={locale}
        current={filters}
        showNotesSort={admin}
        authors={facets.authors}
        genres={facets.genres}
        statusCounts={facets.statusCounts}
        total={facets.total}
      />

      {books.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line p-10 text-center text-muted">
          {t.home.noMatch}
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {books.map((book) => (
            <li key={book.id}>
              <Link href={`/books/${book.id}`} className="group block">
                <div className="transition duration-200 group-hover:-translate-y-1 group-hover:drop-shadow-lg">
                  <BookCover {...book} alt={t.book.coverOf(book.title)} />
                </div>
                <div className="mt-3 space-y-1">
                  <h2 className="line-clamp-2 font-serif leading-snug font-semibold group-hover:text-accent">
                    {book.title}
                  </h2>
                  <p className="truncate text-sm text-muted">{book.author}</p>
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <StatusBadge status={book.status} locale={locale} />
                    {book.genre && (
                      <span className="truncate text-[11px] text-muted">{genreLabel(locale, book.genre)}</span>
                    )}
                    {admin && book.has_notes ? (
                      <span title={t.home.hasNotes} className="text-[11px] text-muted">
                        ✎
                      </span>
                    ) : null}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function EmptyLibrary({ admin, t }: { admin: boolean; t: Dict }) {
  return (
    <div className="mx-auto max-w-md py-20 text-center">
      <div aria-hidden className="text-6xl">📖</div>
      {admin ? (
        <>
          <h1 className="mt-4 font-serif text-2xl font-semibold">{t.home.emptyAdminTitle}</h1>
          <p className="mt-2 text-muted">{t.home.emptyAdminText}</p>
          <Link href="/books/new" className="btn-primary mt-6">
            {t.home.emptyAdminButton}
          </Link>
        </>
      ) : (
        <>
          <h1 className="mt-4 font-serif text-2xl font-semibold">{t.home.emptyTitle}</h1>
          <p className="mt-2 text-muted">{t.home.emptyText}</p>
        </>
      )}
    </div>
  );
}

function LibrarySkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-9 w-48 animate-pulse rounded bg-line/60" />
      <div className="h-10 animate-pulse rounded-lg bg-line/40" />
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} className="aspect-[2/3] animate-pulse rounded-md bg-line/50" />
        ))}
      </div>
    </div>
  );
}
