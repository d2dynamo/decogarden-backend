export type SortOption = {
  [key: string]: 1 | -1;
};

export interface ListOptions<S extends SortOption> {
  page?: number;
  pageSize?: number;
  limit?: number;
  sort?: S;
}
