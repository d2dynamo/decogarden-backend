import type { ObjectId } from "mongodb";
import type { SortOptions } from "global/interfaces/controller";
import type { ItemDoc, Dates } from "global/interfaces/database";
import type { Pagination } from "util/pagination";

export interface Item extends Omit<ItemDoc, Dates> {
  id: string;
  title: string;
  price: number;
  active: boolean;
  amountStorage?: number;
  description?: string;
  properties?: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}

export interface ItemBasic extends Pick<Item, "title" | "price"> {}

export interface ListItem
  extends Pick<Item, "id" | "title" | "price" | "amountStorage"> {}

export type FCreateItem = (
  item: Omit<Item, Dates | "id">
) => Promise<Item["id"]>;

export type FSetItem = (
  id: ObjectId | string,
  item: Partial<Omit<Item, Dates>>
) => Promise<boolean>;

export type FGetItem = (id: ObjectId | string) => Promise<Omit<Item, "id">>;

export type FListItems = (
  f: ListItemFilter,
  o: { pagination: Pagination; sort?: ListItemSorts }
) => Promise<Pick<Item, "id" | "title" | "price" | "amountStorage">[]>;

export type FArchiveItem = (id: ObjectId | string) => Promise<boolean>;

export interface ListItemFilter {
  title?: string;
  priceGte?: number;
  priceLte?: number;
}

export interface ListItemSorts extends SortOptions {
  title: 1 | -1;
  price: 1 | -1;
  createdAt: 1 | -1;
  updatedAt: 1 | -1;
}
