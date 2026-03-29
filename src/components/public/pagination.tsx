import Link from "next/link";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  basePath: string;
  query: Record<string, string | undefined>;
};

export function Pagination({ currentPage, totalPages, basePath, query }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  const buildHref = (page: number) => {
    const params = new URLSearchParams();

    Object.entries(query).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });

    if (page > 1) {
      params.set("page", String(page));
    }

    const paramsString = params.toString();
    return paramsString ? `${basePath}?${paramsString}` : basePath;
  };

  return (
    <nav className="pager" aria-label="Stránkování">
      <Link
        href={buildHref(Math.max(currentPage - 1, 1))}
        className="pager-link"
        aria-disabled={currentPage === 1}
      >
        Předchozí
      </Link>

      <div className="pager-numbers">
        {pages.map((page) => (
          <Link
            key={page}
            href={buildHref(page)}
            className={page === currentPage ? "pager-link is-active" : "pager-link"}
          >
            {page}
          </Link>
        ))}
      </div>

      <Link
        href={buildHref(Math.min(currentPage + 1, totalPages))}
        className="pager-link"
        aria-disabled={currentPage === totalPages}
      >
        Další
      </Link>
    </nav>
  );
}
