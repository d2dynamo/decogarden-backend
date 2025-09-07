import {
  type InsertOneResult,
  type InsertManyResult,
  type UpdateResult,
  type DeleteResult,
  type ModifyResult,
  type BulkWriteResult,
  type FindOptions,
  type UpdateOptions,
  ObjectId,
  type UpdateFilter,
  type Filter,
  type WithId,
  FindCursor,
} from "mongodb";

import type { SortOptions } from "global/interfaces/controller";
import type {
  Dates,
  ItemDoc,
  LogDoc,
  PermissionDoc,
  UserDoc,
  UserPermissionDoc,
} from "global/interfaces/database";

// Database layer - expects fully validated, trusted input.
// No validation, permission checks, or business rules are enforced at this level.
// With exception for ObjectId ids.
// Controllers and business logic are responsible for ensuring data integrity.

export type MongoProjection = Record<string, 0 | 1>;

export type DBOperationResult =
  | InsertOneResult
  | InsertManyResult
  | UpdateResult
  | DeleteResult
  | ModifyResult
  | BulkWriteResult;

type ListUserFilter = {
  userName?: string;
  email?: string;
  mustBeVerified?: boolean;
};

export type UserSorts = {
  userName?: 1 | -1;
  email?: 1 | -1;
  createdAt?: 1 | -1;
  updatedAt?: 1 | -1;
};

export type ListUserDoc = {
  _id: string;
  userName: string;
  email: string;
};

export type FindOpts<S extends SortOptions = SortOptions> = FindOptions & {
  sort?: S;
};

export interface UserLayer {
  /** does not allow duplicate email or userName */
  create: (data: Omit<UserDoc, Dates>) => Promise<InsertOneResult>;
  /** excludes hash and authSecret from projection unless overruled */
  get: (id: ObjectId | string, opts?: FindOpts<UserSorts>) => Promise<UserDoc>;
  /** excludes hash and authSecret from projection unless overruled */
  list: (
    filter?: Filter<UserDoc>,
    opts?: FindOpts<UserSorts>
  ) => Promise<WithId<ListUserDoc>[]>;
  findOne: (
    filter: Filter<UserDoc>,
    opts?: FindOpts<UserSorts>
  ) => Promise<WithId<UserDoc> | null>;
  update: (
    id: ObjectId | string,
    data: UpdateFilter<UserDoc>,
    opts?: UpdateOptions
  ) => Promise<UpdateResult>;
}

type ListItemFilter = {
  title?: string;
  priceGte?: number;
  priceLte?: number;
};

export type ItemSorts = {
  title?: 1 | -1;
  price?: 1 | -1;
  createdAt?: 1 | -1;
  updatedAt?: 1 | -1;
};

export type ListItemDoc = {
  _id: string;
  title: string;
  price: number;
  amountStorage: number;
};

export interface ItemLayer {
  create: (data: Omit<ItemDoc, Dates>) => Promise<InsertOneResult>;
  get: (
    id: ObjectId | string,
    opts?: FindOpts<ItemSorts>
  ) => Promise<WithId<Partial<ItemDoc>> | null>;
  list: (
    filter?: ListItemFilter,
    opts?: FindOpts<ItemSorts>
  ) => Promise<WithId<ListItemDoc>[]>;
  cursor: (
    filter?: ListItemFilter,
    opts?: FindOpts<ItemSorts>
  ) => Promise<FindCursor<WithId<ItemDoc>>>;
  update: (
    id: ObjectId | string,
    update: UpdateFilter<ItemDoc>,
    opts?: UpdateOptions
  ) => Promise<UpdateResult>;
}

type ListAvailablePermissionFilter = {
  showInactive?: boolean;
};

type ListPermissionFilter = {
  permissionId?: ObjectId | string;
  active?: boolean;
};

// This will include both Permission and UserPermission types
export interface PermissionLayer {
  listAvailable: (
    filter?: ListAvailablePermissionFilter,
    opts?: FindOpts
  ) => Promise<WithId<PermissionDoc>[]>;
  /** Get user permission by document _id */
  findOne: (
    filter: Filter<UserPermissionDoc>
  ) => Promise<WithId<UserPermissionDoc> | null>;
  /** Get user permission by userid */
  getUserPermissions: (
    userId: ObjectId | string
  ) => Promise<WithId<UserPermissionDoc> | null>;
  /** Use update for both creating and updating */
  update: (
    userId: ObjectId | string,
    data: UpdateFilter<UserPermissionDoc>,
    opts?: UpdateOptions
  ) => Promise<UpdateResult>;
}

type ListLogFilter = {
  userId?: string;
  level?: string;
  type?: string;
  dateFrom?: number;
  dateTo?: number;
};

export interface LogLayer {
  create: (data: LogDoc) => Promise<InsertOneResult>;
  list: (
    filter?: ListLogFilter,
    opts?: FindOpts<{ createdAt: 1 | -1 }>
  ) => Promise<WithId<LogDoc>[]>;
  get: (id: ObjectId | string) => Promise<LogDoc | null>;
}
