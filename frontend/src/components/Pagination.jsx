import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const windowSize = 1;
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - page) <= windowSize) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Pagination">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-secondary/40
                   text-primary transition hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Previous page"
      >
        <HiChevronLeft />
      </button>

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="px-1 text-espresso/40">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            aria-current={p === page ? "page" : undefined}
            className={`flex h-10 w-10 items-center justify-center rounded-full font-medium transition
              ${p === page ? "bg-primary text-cream shadow-soft" : "text-primary hover:bg-primary/5"}`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-secondary/40
                   text-primary transition hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Next page"
      >
        <HiChevronRight />
      </button>
    </nav>
  );
}
