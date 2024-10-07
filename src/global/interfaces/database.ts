import type { ObjectId } from "mongodb";

type PaymentMethod = "stripe" | "paysera" | "transfer";
type OrderStatus =
  | "awaitingPayment"
  | "failedPayment"
  | "cancelled"
  | "delivering"
  | "completed";
type LogType = "ERROR" | "INFO" | "WARN";
type LogLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

interface DefaultDoc {
  createdAt: Date;
  updatedAt: Date;
}

export type Dates = "createdAt" | "updatedAt";

/**
 *  NOTE: All docs have a _id.
 * We do not include it here cause its simpler to insert docs that way. mongo driver inserts _id as optional existing type in fetch functions.
 */

/** Collection document standard defs */
export type CollectionDocs = {
  users: UserDoc;
  items: ItemDoc;
  orders: OrderDoc;
  coupons: CouponDoc;
  permissions: PermissionDoc;
  userPermissions: UserPermissionDoc;
};

/** Available collections in bonkbot database */
export type DekoCollections = keyof CollectionDocs;

export interface UserDoc extends DefaultDoc {
  userName: string;
  email: string;
  phone?: string;
  authSecret?: string;
  hash: string;
  emailVerify: boolean;
  phoneVerify?: boolean;
  ttl?: Date; // time to live on user creation, 1 day until verified.
  lastLoginAttempt?: Date;
  lastLogin?: Date;
}

export interface ItemDoc extends DefaultDoc {
  title: string;
  description?: string;
  price: number; //float in euro
  properties?: { [key: string]: string | number | object };
  amountStorage?: number;
  active: boolean;
}

export interface OrderDoc extends DefaultDoc {
  customerId: ObjectId;
  itemId: ObjectId;
  note?: string;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  couponId?: ObjectId;
}

export interface CouponDoc extends DefaultDoc {
  itemId?: ObjectId;
  userId?: ObjectId;
  percent?: number;
  flat?: number;
  validFrom?: Date;
  validTo: Date;
}

// Logs should never get updated hence no updatedAt
export interface LogDoc {
  type: LogType;
  level: LogLevel;
  userId?: ObjectId;
  message: string;
  data: { [key: string]: any };
  createdAt: Date;
}

export interface PermissionDoc extends DefaultDoc {
  name: string;
  active: boolean;
}

export interface UserPermissionDoc extends DefaultDoc {
  userId: ObjectId;
  permissionId: ObjectId;
  active: boolean;
}

export interface ShipmentDoc {}
