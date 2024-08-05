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

interface DefaultDocument {
  createdAt?: Date;
  updatedAt?: Date;
}

export type Dates = "createdAt" | "updatedAt";

/** Collection document standard defs */
export type CollectionDocs = {
  users: UserDoc;
  items: ItemDoc;
  orders: OrderDoc;
  coupons: CouponDoc;
};

/** Available collections in bonkbot database */
export type DekoCollections = keyof CollectionDocs;

export interface UserDoc extends DefaultDocument {
  email: string;
  hash: string;
  salt: string;
  lastLoginAttempt: Date;
  lastLogin: Date;
}

export interface ItemDoc extends DefaultDocument {
  title: string;
  description?: string;
  price: number; //float in euro
  properties?: { [key: string]: string | number | object };
  amountStorage?: number;
  active: boolean;
}

export interface OrderDoc {
  customerId: ObjectId;
  itemId: ObjectId;
  note?: string;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  couponId?: ObjectId;
}

export interface CouponDoc {
  itemId?: ObjectId;
  userId?: ObjectId;
  percent?: number;
  flat?: number;
  validFrom?: Date;
  validTo: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface LogDoc {
  type: LogType;
  level: LogLevel;
  userId?: ObjectId;
  message: string;
  data: { [key: string]: any };
}

export interface ShipmentDoc {}
