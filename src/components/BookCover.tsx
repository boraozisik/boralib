/* eslint-disable @next/next/no-img-element -- covers come from our own API route */

const SPINE_COLORS = [
  "from-[#7a3b2e] to-[#4e231a]",
  "from-[#2f4a5c] to-[#1c2e3a]",
  "from-[#4b5a2f] to-[#2e381c]",
  "from-[#6b4f7a] to-[#41304b]",
  "from-[#8a6a2b] to-[#5a4419]",
  "from-[#2e5a52] to-[#1b3833]",
];

/** Cover image; without one, draws a colored placeholder with the title. */
export function BookCover({
  cover,
  title,
  author,
  id,
  alt,
  className = "",
}: {
  cover: string | null;
  title: string;
  author: string;
  id: number;
  /** Image alt text; defaults to the title. */
  alt?: string;
  className?: string;
}) {
  if (cover) {
    return (
      <img
        src={`/api/covers/${cover}`}
        alt={alt ?? title}
        className={`aspect-[2/3] w-full rounded-md object-cover shadow-md ${className}`}
        loading="lazy"
      />
    );
  }
  const color = SPINE_COLORS[id % SPINE_COLORS.length];
  return (
    <div
      className={`flex aspect-[2/3] w-full flex-col justify-between rounded-md bg-gradient-to-br p-3 text-[#f6efe4] shadow-md ${color} ${className}`}
    >
      <div className="border-t border-[#f6efe4]/40 pt-2 font-serif text-sm leading-snug font-semibold [overflow-wrap:anywhere]">
        {title}
      </div>
      <div className="border-b border-[#f6efe4]/40 pb-2 text-xs opacity-80">
        {author}
      </div>
    </div>
  );
}
