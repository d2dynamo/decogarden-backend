import type { PermissionDoc, Dates, ItemDoc } from "./database";

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

export interface Permission extends Partial<Omit<PermissionDoc, Dates>> {
  id: string;
  name: string;
  active: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface AddPermission extends Omit<PermissionDoc, Dates> {}

export interface ListPermissionFilter {}

export interface ListPermission extends Permission {}
