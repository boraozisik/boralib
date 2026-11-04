import "server-only";
import { connection } from "next/server";
import type { InStatement } from "@libsql/client";
import { db, query, run } from "./db";
import { genreLabel } from "./i18n";
import type { Book, BookFilters, BookSummary, Status } from "./types";

// connection() makes every read happen at request time instead of being
// baked in at build time.

// Turkish alphabet order (Ç after C, Ş after S, İ after I); ignores case.
const collator = new Intl.Collator("tr", { sensitivity: "base", numeric: true });

/** Case- and accent-insensitive form for search: "İnce", "INCE" and "ince" all match; "oguz" matches "Oğuz". */
function normalize(s: string) {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/ı/g, "i");
}

export async function getBooks(filters: BookFilters = {}): Promise<BookSummary[]> {
  await connection();
  let books = await query<BookSummary>(
    `SELECT id, title, author, genre, status, cover, notes_updated_at, created_at, updated_at,
            (notes <> '') AS has_notes
       FROM books
      ORDER BY created_at DESC, id DESC`,
  );

  // Filtering happens in JS so non-ASCII letters match correctly.
  const q = normalize(filters.q?.trim() ?? "");
  if (q) {
    books = books.filter(
      (b) =>
        normalize(b.title).includes(q) ||
        normalize(b.author).includes(q) ||
        normalize(b.genre).includes(q) ||
        normalize(genreLabel("tr", b.genre)).includes(q),
    );
  }
  if (filters.author) books = books.filter((b) => b.author === filters.author);
  if (filters.genre) books = books.filter((b) => b.genre === filters.genre);
  if (filters.status) books = books.filter((b) => b.status === filters.status);

  switch (filters.sort) {
    case "title":
      books.sort((a, b) => collator.compare(a.title, b.title));
      break;
    case "author":
      books.sort(
        (a, b) =>
          collator.compare(a.author, b.author) ||
          collator.compare(a.title, b.title),
      );
      break;
    case "notes":
      books.sort((a, b) =>
        (b.notes_updated_at ?? "").localeCompare(a.notes_updated_at ?? ""),
      );
      break;
    default:
      // Default "Recently added": newest first; books added at the same
      // moment (like the initial library import) fall back to A-Z.
      books.sort(
        (a, b) =>
          b.created_at.localeCompare(a.created_at) ||
          collator.compare(a.title, b.title),
      );
  }
  return books;
}

export async function getBook(id: number): Promise<Book | undefined> {
  await connection();
  return findBookRow(id);
}

/** Existing authors/genres for filter menus and form suggestions. */
export async function getFacets() {
  await connection();
  const rows = await query<{ author: string; genre: string; status: Status }>(
    "SELECT author, genre, status FROM books",
  );
  const unique = (values: string[]) =>
    [...new Set(values.filter(Boolean))].sort(collator.compare);
  const statusCounts: Record<string, number> = {};
  for (const r of rows) statusCounts[r.status] = (statusCounts[r.status] ?? 0) + 1;
  return {
    authors: unique(rows.map((r) => r.author)),
    genres: unique(rows.map((r) => r.genre)),
    statusCounts,
    total: rows.length,
  };
}

// ---- Writes (called only from server actions) ----

export type BookInput = {
  title: string;
  author: string;
  genre: string;
  status: Status;
};

export type NewCover = { id: string; mime: string; data: Uint8Array };

function insertCoverStmt(cover: NewCover): InStatement {
  return {
    sql: "INSERT INTO covers (id, mime, data) VALUES (?, ?, ?)",
    args: [cover.id, cover.mime, cover.data],
  };
}

export async function insertBook(input: BookInput, cover: NewCover | null) {
  const stmts: InStatement[] = [];
  if (cover) stmts.push(insertCoverStmt(cover));
  stmts.push({
    sql: `INSERT INTO books (title, author, genre, status, cover)
          VALUES (?, ?, ?, ?, ?)`,
    args: [input.title, input.author, input.genre, input.status, cover?.id ?? null],
  });
  const results = await (await db()).batch(stmts, "write");
  return Number(results.at(-1)!.lastInsertRowid);
}

/**
 * Updates a book. `cover` is the new cover, `null` to remove it, or
 * `undefined` to keep the current one. The old cover image is deleted when replaced.
 */
export async function updateBookRow(
  existing: Book,
  input: BookInput,
  cover?: NewCover | null,
) {
  const coverId = cover === undefined ? existing.cover : (cover?.id ?? null);
  const stmts: InStatement[] = [];
  if (cover) stmts.push(insertCoverStmt(cover));
  stmts.push({
    sql: `UPDATE books
             SET title = ?, author = ?, genre = ?, status = ?, cover = ?,
                 updated_at = datetime('now')
           WHERE id = ?`,
    args: [input.title, input.author, input.genre, input.status, coverId, existing.id],
  });
  if (existing.cover && existing.cover !== coverId) {
    stmts.push({ sql: "DELETE FROM covers WHERE id = ?", args: [existing.cover] });
  }
  await (await db()).batch(stmts, "write");
}

export async function deleteBookRow(book: Book) {
  const stmts: InStatement[] = [{ sql: "DELETE FROM books WHERE id = ?", args: [book.id] }];
  if (book.cover) stmts.push({ sql: "DELETE FROM covers WHERE id = ?", args: [book.cover] });
  await (await db()).batch(stmts, "write");
}

export async function findBookRow(id: number) {
  const rows = await query<Book>("SELECT * FROM books WHERE id = ?", [id]);
  return rows[0];
}

export async function updateNotesRow(id: number, notes: string) {
  await run(
    `UPDATE books SET notes = ?, notes_updated_at = datetime('now') WHERE id = ?`,
    [notes, id],
  );
}
