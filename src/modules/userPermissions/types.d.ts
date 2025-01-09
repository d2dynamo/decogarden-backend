import type {
  Dates,
  UserPermissionDoc,
} from '../../global/interfaces/database';

export interface UserPermissions extends Omit<UserPermissionDoc, Dates> {
  id: string;
  permissions: string[];
}

export interface SetUserPermission {
  userId: string | ObjectId;
  permissionId: string;
  active?: boolean; // default: true
}

export interface ListUserPermissionFilter {}

export interface ListUserPermission extends Omit<UserPermission, 'userId'> {
  name: string;
}
