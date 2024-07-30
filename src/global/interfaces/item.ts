import type { ListOptionSort } from "./controller";

export interface AddItem {
  title: string;
  description: string;
  price: number;
  properties?: { [key: string]: any };
  amountStorage?: number;
}

export interface UpdateItem {
  title?: string;
  description?: string;
  price?: number;
  properties?: { [key: string]: any };
  amountStorage?: number;
}

export interface GetItem {
  id: string;
}

export interface ListItemFilter {
  title?: string;
  priceGte?: string;
  priceLte?: string;
}

export interface ListItemSorts extends ListOptionSort {
  title: 1 | -1;
  price: 1 | -1;
  createdAt: 1 | -1;
  updatedAt: 1 | -1;
}
