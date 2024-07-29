import type { ObjectId } from "mongodb";

type PaymentMethod = "stripe" | "paysera" | "transfer";
type OrderStatus = "awaitingPayment" | "cancelled" | "delivering" | "completed";
type LogType = "ERROR" | "INFO" | "WARN";
type LogLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

interface DefaultDocument {
  _id: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/** Collection document standard defs */
export type CollectionDocs = {
  users: User;
  items: Item;
  orders: Order;
  priceReductions: PriceReduction;
};

/** Available collections in bonkbot database */
export type DekoCollections = keyof CollectionDocs;

export interface User extends DefaultDocument {
  email: string;
  hash: string;
  salt: string;
  lastLoginAttempt: Date;
  lastLogin: Date;
}

export interface Item extends DefaultDocument {
  title: string;
  description: string;
  price: number; //float €
  properties: { [key: string]: any };
  amountStorage: number;
}

export interface Order {
  customerId: ObjectId;
  itemId: ObjectId;
  note?: string;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  priceReductionId?: ObjectId;
}

export interface PriceReduction {
  itemId: ObjectId;
  percent?: number;
  flat?: number;
  validFrom?: Date;
  validTo: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Logs {
  type: LogType;
  level: LogLevel;
  userId?: ObjectId;
  message: string;
  data: { [key: string]: any };
}

export interface Shipment {}