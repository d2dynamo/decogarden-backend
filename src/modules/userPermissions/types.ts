import type { ObjectId } from "mongodb";

export interface UserPermission {
  id: string;
  name: string;
  active: boolean;
  createdAt: number;
  updatedAt: number;
}

export type FUserHasPermission = (
  userId: string,
  permissionId: string
) => Promise<boolean>;

export interface SetUserPermission {
  userId: string | ObjectId;
  permissionId: string;
  active?: boolean; // default: true
}

export type FSetUserPermission = (input: SetUserPermission) => Promise<boolean>;
