import type {
  Dates,
  UserPermissionDoc,
} from "../../global/interfaces/database";

export interface UserPermission extends Omit<UserPermissionDoc, Dates> {
  id: string;
  permissionId: string;
  createdAt: number;
  updatedAt: number;
}

export interface SetUserPermission
  extends Omit<UserPermissionDoc, Dates | "active"> {
  active?: boolean; // default: true
}

export interface ListUserPermissionFilter {}

export interface ListUserPermission extends Omit<UserPermission, "userId"> {}
