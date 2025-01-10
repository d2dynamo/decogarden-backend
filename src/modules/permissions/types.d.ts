import type { PermissionDoc, Dates } from '../../global/interfaces/database';

export interface Permission extends Omit<PermissionDoc, Dates> {
  id: string;
  createdAt: number;
  updatedAt: number;
}

export type FListPermissions = (
  showInactive?: boolean
) => Promise<Permission[]>;
