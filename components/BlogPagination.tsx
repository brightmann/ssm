import styled from 'styled-components';
import Link from './Link';

const Nav = styled.nav`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.75rem;
  margin-top: 3rem;
  flex-wrap: wrap;
`;

const Current = styled.span`
  font-weight: bold;
`;

const Ellipsis = styled.span`
  opacity: 0.6;
`;

const Disabled = styled.span`
  opacity: 0.4;
`;

const pageHref = (page: number): string =>
  page === 1 ? '/blog' : `/blog/page/${page}`;

// Numbered items with ellipsis gaps: full 1..N list up to 7 pages,
// otherwise first, last, and current ± 1 with … in between.
const pageItems = (current: number, total: number): (number | '…')[] => {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const nums = [...new Set([1, total, current - 1, current, current + 1])]
    .filter((n) => n >= 1 && n <= total)
    .sort((a, b) => a - b);
  const items: (number | '…')[] = [];
  let prev = 0;
  for (const n of nums) {
    if (prev && n - prev > 1) {
      items.push('…');
    }
    items.push(n);
    prev = n;
  }
  return items;
};

interface BlogPaginationProps {
  currentPage: number;
  totalPages: number;
}

// Previous | 1 | 2 | … | N | Next. Hidden when there is a single page.
const BlogPagination = ({ currentPage, totalPages }: BlogPaginationProps) => {
  if (totalPages <= 1) {
    return null;
  }
  return (
    <Nav aria-label="Blog pagination">
      {currentPage > 1 ? (
        <Link href={pageHref(currentPage - 1)}>Previous</Link>
      ) : (
        <Disabled>Previous</Disabled>
      )}
      {pageItems(currentPage, totalPages).map((item, i) =>
        item === '…' ? (
          <Ellipsis key={`ellipsis-${i}`}>…</Ellipsis>
        ) : item === currentPage ? (
          <Current key={item}>{item}</Current>
        ) : (
          <Link key={item} href={pageHref(item)}>
            {item}
          </Link>
        ),
      )}
      {currentPage < totalPages ? (
        <Link href={pageHref(currentPage + 1)}>Next</Link>
      ) : (
        <Disabled>Next</Disabled>
      )}
    </Nav>
  );
};

export default BlogPagination;
