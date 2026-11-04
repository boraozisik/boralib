// Display names for statuses and sorts live in lib/i18n.ts.

export const STATUSES = ["to-read", "reading", "finished"] as const;

export type Status = (typeof STATUSES)[number];

export function isStatus(value: unknown): value is Status {
  return STATUSES.includes(value as Status);
}

export type Book = {
  id: number;
  title: string;
  author: string;
  genre: string;
  status: Status;
  cover: string | null;
  notes: string;
  notes_updated_at: string | null;
  created_at: string;
  updated_at: string;
};

/** A book in the list view: everything except the (possibly long) notes text. */
export type BookSummary = Omit<Book, "notes"> & { has_notes: number };

/** The first entry is the default sort ("notes" is admin-only). */
export const SORTS = ["recent", "title", "author", "notes"] as const;

export type BookFilters = {
  q?: string;
  author?: string;
  genre?: string;
  status?: string;
  sort?: string;
};
