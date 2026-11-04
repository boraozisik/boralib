import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Geist, Lora } from "next/font/google";
import { logout } from "@/app/actions";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { isAdmin } from "@/lib/auth";
import { getDict } from "@/lib/locale";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin", "latin-ext"],
});

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDict();
  return {
    title: { default: t.brand, template: `%s · ${t.brand}` },
    description: t.description,
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${lora.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <header className="sticky top-0 z-20 border-b border-line bg-paper/90 backdrop-blur">
          <div className="mx-auto flex min-h-[61px] max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <Link href="/" className="flex items-center gap-2">
              <span aria-hidden className="text-2xl">📚</span>
              <span className="font-serif text-xl font-semibold tracking-tight">
                <Suspense fallback={null}>
                  <Brand />
                </Suspense>
              </span>
            </Link>
            <Suspense fallback={<div className="h-8 w-28" />}>
              <HeaderActions />
            </Suspense>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>
        <footer className="mx-auto flex w-full max-w-6xl justify-end px-4 pt-10 pb-4 sm:px-6">
          <Suspense fallback={<AdminLink />}>
            <FooterAuth />
          </Suspense>
        </footer>
      </body>
    </html>
  );
}

async function Brand() {
  const { t } = await getDict();
  return t.brand;
}

async function HeaderActions() {
  const [{ locale, t }, admin] = await Promise.all([getDict(), isAdmin()]);
  return (
    <div className="flex items-center gap-3">
      {admin && (
        <Link href="/books/new" className="btn-primary">
          <span aria-hidden>+</span> {t.addBook}
        </Link>
      )}
      <LanguageSwitcher locale={locale} />
    </div>
  );
}

async function FooterAuth() {
  const [{ t }, admin] = await Promise.all([getDict(), isAdmin()]);
  if (!admin) return <AdminLink />;
  return (
    <form action={logout} className="text-xs text-muted">
      {t.signedInAsAdmin} ·{" "}
      <button type="submit" className="underline-offset-2 hover:text-accent hover:underline">
        {t.signOut}
      </button>
    </form>
  );
}

function AdminLink() {
  return (
    <Link href="/admin" className="text-[11px] text-muted/50 hover:text-muted">
      admin
    </Link>
  );
}
