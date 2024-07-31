import type { ListOptionSort } from "./controller";
import type { ItemDoc, Dates } from "./database";

export interface Item extends Partial<Omit<ItemDoc, Dates>> {
  id: string;
  title: string;
  price: number;
  active: boolean;
  createdAt: number;
  updatedAt: number;
  description?: string;
  properties?: { [key: string]: string | number | object };
}

export interface AddItem extends Omit<ItemDoc, Dates> {}

export interface UpdateItem extends Partial<Omit<ItemDoc, Dates>> {}

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

export interface ListItem
  extends Pick<Item, "id" | "title" | "price" | "amountStorage"> {}
