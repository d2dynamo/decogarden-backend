import {
  PAGINATION_DEFAULT_PAGE_SIZE,
  PAGINATION_MAX_PAGE_SIZE,
} from "global/const";

export interface Pagination {
  page: number;
  pageSize: number;

  limit: number;
  skip: number;
}

export const createPagination = (
  page: number,
  pageSize: number
): Pagination => {
  const pg = page >= 1 ? page : 1;
  const ps =
    pageSize >= 1 && pageSize <= PAGINATION_MAX_PAGE_SIZE
      ? pageSize
      : (PAGINATION_DEFAULT_PAGE_SIZE as number);

  return {
    page: pg,
    pageSize: ps,
    limit: ps,
    skip: (pg - 1) * ps,
  };
};
