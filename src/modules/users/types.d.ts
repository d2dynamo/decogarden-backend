import type { SortOption } from "../../global/interfaces/controller";
import { Dates } from "../../global/interfaces/database";
import { UserDoc } from "../../global/interfaces/database";

export interface User extends Omit<UserDoc, Dates> {
  id: string;
  createdAt: number;
  updatedAt: number;
}

export interface SetUser extends Omit<UserDoc, Dates | "authSecret"> {
  password: string;
}

export interface ListUserFilter {
  userName?: string;
  email?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  createdAtGte?: number;
  createdAtLte?: number;
}

export interface ListUserSorts extends SortOption {
  title: 1 | -1;
  price: 1 | -1;
  createdAt: 1 | -1;
  updatedAt: 1 | -1;
}

export interface ListUser extends Pick<User, "id", "userName", "email"> {}
