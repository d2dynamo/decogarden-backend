import type { PermissionDoc, Dates } from "../../global/interfaces/database";

export interface Permission extends Omit<PermissionDoc, Dates> {
  id: string;
  name: string;
  active: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface AddPermission extends Omit<PermissionDoc, Dates | "active"> {
  active?: boolean;
}

export interface ListPermissionFilter {}

export interface ListPermission extends Permission {}
