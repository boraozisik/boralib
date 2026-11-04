"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { checkCredentials, endSession, requireAdmin, startSession } from "@/lib/auth";
import { isLocale, LOCALE_COOKIE, translateError } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import {
  deleteBookRow,
  findBookRow,
  insertBook,
  updateBookRow,
  updateNotesRow,
  type BookInput,
} from "@/lib/books";
import { readCoverFile } from "@/lib/covers";
import { isStatus } from "@/lib/types";

export type FormState = { error?: string } | undefined;

function readInput(formData: FormData): BookInput | string {
  const text = (key: string) => String(formData.get(key) ?? "").trim();
  const title = text("title");
  const author = text("author");
  const genre = text("genre");
  const status = text("status");
  if (!title) return "Title is required.";
  if (!author) return "Author is required.";
  return { title, author, genre, status: isStatus(status) ? status : "to-read" };
}

/** The new cover from the form, if one was chosen. */
async function readNewCover(formData: FormData) {
  const file = formData.get("coverFile");
  if (file instanceof File && file.size > 0) return readCoverFile(file);
  return undefined;
}

/** A form error in the visitor's language. */
async function formError(err: unknown): Promise<FormState> {
  const text = typeof err === "string" ? err : err instanceof Error ? err.message : "Something went wrong.";
  return { error: translateError(await getLocale(), text) };
}

// ---- Books ----

export async function createBook(_prev: FormState, formData: FormData): Promise<FormState> {
  let id: number;
  try {
    await requireAdmin();
    const input = readInput(formData);
    if (typeof input === "string") return formError(input);
    id = await insertBook(input, (await readNewCover(formData)) ?? null);
  } catch (err) {
    return formError(err);
  }
  revalidatePath("/");
  redirect(`/books/${id}`);
}

export async function updateBook(
  id: number,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    await requireAdmin();
    const existing = await findBookRow(id);
    if (!existing) return formError("Book not found.");
    const input = readInput(formData);
    if (typeof input === "string") return formError(input);
    const newCover = await readNewCover(formData);
    const cover = newCover ?? (formData.get("removeCover") === "1" ? null : undefined);
    await updateBookRow(existing, input, cover);
  } catch (err) {
    return formError(err);
  }
  revalidatePath("/");
  revalidatePath(`/books/${id}`);
  redirect(`/books/${id}`);
}

export async function deleteBook(id: number) {
  await requireAdmin();
  const existing = await findBookRow(id);
  if (existing) await deleteBookRow(existing);
  revalidatePath("/");
  redirect("/");
}

export async function saveNotes(id: number, notes: string) {
  await requireAdmin();
  if (!(await findBookRow(id))) throw new Error("Book not found.");
  await updateNotesRow(id, notes);
  return { savedAt: new Date().toISOString() };
}

export async function setBookStatus(id: number, status: string) {
  await requireAdmin();
  const existing = await findBookRow(id);
  if (!existing || !isStatus(status)) return;
  await updateBookRow(existing, { ...existing, status });
  revalidatePath("/");
  revalidatePath(`/books/${id}`);
}

// ---- Admin login ----

/**
 * Only allow redirects back into this site. Rejects "//evil.com", "/\evil.com"
 * and paths with whitespace, which browsers can turn into links to other sites.
 */
function safeNext(value: FormDataEntryValue | null) {
  const next = String(value ?? "");
  return /^\/(?![/\\])[^\s\\]*$/.test(next) ? next : "/";
}

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!checkCredentials(username, password)) {
    // Slow down password guessing.
    await new Promise((r) => setTimeout(r, 1000));
    return formError("Wrong username or password.");
  }
  await startSession();
  revalidatePath("/", "layout");
  redirect(safeNext(formData.get("next")));
}

// ---- Language ----

/** Saves the chosen display language for a year and re-renders the pages. */
export async function setLocale(locale: string) {
  if (!isLocale(locale)) return;
  (await cookies()).set(LOCALE_COOKIE, locale, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
  revalidatePath("/", "layout");
}

export async function logout() {
  await endSession();
  revalidatePath("/", "layout");
  redirect("/");
}
