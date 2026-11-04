import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/LoginForm";
import { isAdmin, isAuthConfigured } from "@/lib/auth";
import { getDict } from "@/lib/locale";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDict();
  return { title: t.admin.metaTitle, robots: { index: false, follow: false } };
}

export default function AdminPage({ searchParams }: PageProps<"/admin">) {
  return (
    <div className="mx-auto max-w-sm py-10">
      <Suspense fallback={<div className="mt-14 h-56 animate-pulse rounded-xl bg-line/40" />}>
        <AdminContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function AdminContent({ searchParams }: { searchParams: PageProps<"/admin">["searchParams"] }) {
  const [{ locale, t }, admin] = await Promise.all([getDict(), isAdmin()]);
  const next = (await searchParams).next;

  let body: React.ReactNode;
  if (admin) {
    body = (
      <p className="mt-4 text-muted">
        {t.admin.already}{" "}
        <Link href="/" className="text-accent hover:underline">
          {t.admin.goLibrary}
        </Link>
      </p>
    );
  } else if (!isAuthConfigured()) {
    body = (
      <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
        {t.admin.notConfigured} <code>ADMIN_USERNAME</code>, <code>ADMIN_PASSWORD</code>,{" "}
        <code>AUTH_SECRET</code>
      </p>
    );
  } else {
    body = <LoginForm next={typeof next === "string" ? next : "/"} locale={locale} />;
  }

  return (
    <>
      <h1 className="font-serif text-2xl font-semibold">{t.admin.title}</h1>
      {body}
    </>
  );
}
