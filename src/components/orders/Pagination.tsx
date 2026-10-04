import Link from "next/link";

export function Pagination({ page, pages }: { page: number; pages: number }) {
  if (pages <= 1) return null;
  const href = (n: number) => (n === 1 ? "/orders" : `/orders?page=${n}`);
  return (
    <nav className="pager" aria-label="Order pages">
      {page > 1 ? <Link className="ghost" href={href(page - 1)}>‹ Newer</Link> : <span className="ghost" aria-disabled="true">‹ Newer</span>}
      <span className="small">Page <b className="ink">{page}</b> of {pages}</span>
      {page < pages ? <Link className="ghost" href={href(page + 1)}>Older ›</Link> : <span className="ghost" aria-disabled="true">Older ›</span>}
    </nav>
  );
}
