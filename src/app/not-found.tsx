import Link from "next/link";
import { Suspense } from "react";
import { getDict } from "@/lib/locale";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-20 text-center">
      <div aria-hidden className="text-5xl">🔎</div>
      <Suspense fallback={<div className="mx-auto mt-4 h-24 w-64 animate-pulse rounded bg-line/40" />}>
        <NotFoundText />
      </Suspense>
    </div>
  );
}

async function NotFoundText() {
  const { t } = await getDict();
  return (
    <>
      <h1 className="mt-4 font-serif text-2xl font-semibold">{t.notFound.title}</h1>
      <p className="mt-2 text-muted">{t.notFound.text}</p>
      <Link href="/" className="btn-primary mt-6">
        {t.notFound.back}
      </Link>
    </>
  );
}
