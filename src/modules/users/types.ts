import type { ObjectId } from "mongodb";
import type { SortOptions } from "../../global/interfaces/controller";
import type { Dates } from "../../global/interfaces/database";
import type { UserDoc } from "../../global/interfaces/database";
import type { Pagination } from "util/pagination";
import type { UserSorts } from "modules/database/types";

export interface User
  extends Omit<
    UserDoc,
    Dates | "lastLogin" | "lastLoginAttempt" | "hash" | "authSecret"
  > {
  id: string;
  lastLogin?: number;
  lastLoginAttempt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface SetUser extends Partial<Omit<User, Dates>> {}

export type FCreateUser = (user: {
  email: string;
  password: string;
  userName: string;
  phone?: string;
}) => Promise<User["id"]>;

export type FVerifyUser = (token: string) => Promise<boolean>;

export type FResendVerify = (input: {
  userId: ObjectId | string;
  email?: string;
  phone?: string;
}) => Promise<void>;

export type FGetUser = (input: {
  id?: ObjectId | string;
  email?: string;
}) => Promise<User>;

export type FGetUserBasic = (
  id: ObjectId | string
) => Promise<Pick<User, "userName" | "email">>;

export type ListUserOptions = {
  pagination: Pagination;
  sort?: UserSorts;
};

export type FListUsers = (
  f: ListUserFilter,
  o: ListUserOptions
) => Promise<Pick<User, "id" | "userName" | "email">[]>;

export type FSetUser = (user: SetUser) => Promise<boolean>;

export type FArchiveUser = (id: ObjectId | string) => Promise<boolean>;

export type FGenerate2fa = (
  userId: ObjectId | string,
  password: string
) => Promise<string>;

export type FEnable2fa = (
  userId: ObjectId | string,
  code: string
) => Promise<boolean>;

export type FDisable2fa = (
  userId: ObjectId | string,
  password: string
) => Promise<boolean>;

export type FVerify2fa = (
  userId: ObjectId | string,
  code: string
) => Promise<boolean>;

export interface ListUserFilter {
  userName?: string;
  email?: string;
  mustBeVerified?: boolean;
}
