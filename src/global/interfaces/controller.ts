export type ListOptionSort = {
  [key: string]: 1 | -1;
};

export interface ListOptions<S extends ListOptionSort> {
  page?: number;
  pageSize?: number;
  limit?: number;
  sort?: S;
}
