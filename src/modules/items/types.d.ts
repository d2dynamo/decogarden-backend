import type { SortOption } from '../../global/interfaces/controller';
import type { ItemDoc, Dates } from '../../global/interfaces/database';

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

export interface ItemBasic extends Pick<Item, 'title' | 'price'> {}

export interface ListItem
  extends Pick<Item, 'id' | 'title' | 'price' | 'amountStorage'> {}

export type FCreateItem = (
  item: Omit<Item, Dates | 'id'>
) => Promise<Item['id']>;

export type FSetItem = (item: Partial<Item, Dates>) => Promise<boolean>;

export type FGetItem = (id: ObjectId | string) => Promise<Omit<Item, 'id'>>;

export type FGetItemBasic = (id: ObjectId | string) => Promise<ItemBasic>;

export type FListItems = (
  f?: ListItemFilter,
  o?: ListOptions<ListItemSorts>
) => Promise<Pick<Item, 'id' | 'title' | 'price' | 'amountStorage'>[]>;

export type FArchiveItem = (id: ObjectId | string) => Promise<boolean>;

export interface ListItemFilter {
  title?: string;
  priceGte?: number;
  priceLte?: number;
}

export interface ListItemSorts extends SortOption {
  title: 1 | -1;
  price: 1 | -1;
  createdAt: 1 | -1;
  updatedAt: 1 | -1;
}
