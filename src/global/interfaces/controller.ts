export type ListOptionSort = {
  [key: string]: 1 | -1;
};

export interface ListOptions<T extends ListOptionSort> {
  page?: number;
  pageSize?: number;
  limit?: number;
  sort?: T | ListOptionSort;
}
