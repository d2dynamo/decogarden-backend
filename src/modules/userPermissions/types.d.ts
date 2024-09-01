import type {
  Dates,
  UserPermissionDoc,
} from "../../global/interfaces/database";

export interface UserPermission extends Omit<UserPermissionDoc, Dates> {
  id: string;
  createdAt: number;
  updatedAt: number;
}

export interface AddUserPermission
  extends Omit<UserPermissionDoc, Dates | "active"> {
  active?: boolean; // default: true
}
