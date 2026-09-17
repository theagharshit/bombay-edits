/**
 * Pagination helpers — parse searchParams into Prisma-ready skip/take/orderBy.
 */

export type PaginationParams = {
  skip: number;
  take: number;
  page: number;
};

export function parsePagination(
  searchParams: Record<string, string | string[] | undefined>,
  defaultTake = 50,
  maxTake = 100,
): PaginationParams {
  const rawPage = parseInt(String(searchParams.page ?? '1'), 10);
  const rawTake = parseInt(String(searchParams.take ?? String(defaultTake)), 10);
  const page = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;
  const take = isNaN(rawTake) || rawTake < 1 ? defaultTake : Math.min(rawTake, maxTake);
  return { skip: (page - 1) * take, take, page };
}

export function buildPaginationMeta(total: number, page: number, take: number) {
  const totalPages = Math.ceil(total / take);
  return { total, page, take, totalPages, hasNext: page < totalPages, hasPrev: page > 1 };
}
