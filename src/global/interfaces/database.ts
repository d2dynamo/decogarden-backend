import type { ObjectId } from 'mongodb';
import type { LogLevel, LogType } from '../../modules/logger/types';
import type { CountryCode } from '../../modules/orders/types';

type PaymentMethod = 'stripe' | 'paysera' | 'transfer';
type OrderStatus =
  | 'awaitingPayment'
  | 'failedPayment'
  | 'cancelled'
  | 'delivering'
  | 'paused'
  | 'completed';

interface DefaultDoc {
  createdAt: Date;
  updatedAt: Date;
}

export type Dates = 'createdAt' | 'updatedAt';

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
  logs: LogDoc;
  shipments: ShipmentDoc;
  payments: PaymentDoc;
};

/** Available collections in bonkbot database */
export type DekoCollections = keyof CollectionDocs;

export interface UserDoc extends DefaultDoc {
  userName: string;
  email: string;
  phone?: string;
  authSecret?: string;
  hash?: string;
  emailVerify: boolean;
  phoneVerify?: boolean;
  ttl?: Date; // time to live on user creation, 1 day until verified.
  lastLoginAttempt?: Date;
  lastLogin?: Date;
  archivedAt?: Date; // If user is archived. User should not be used in any operations except direct get.
}

export interface ItemDoc extends DefaultDoc {
  title: string;
  price: number; //float in euro
  description?: string;
  properties?: Record<string, any>;
  amountStorage?: number;
  active: boolean;
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

export interface UserPermissionDoc extends Omit<DefaultDoc, Dates> {
  userId: ObjectId;
  permissions: {
    id: ObjectId;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
  }[];
}

export interface OrderDoc extends DefaultDoc {
  id: string;
  customerId?: ObjectId;
  itemId: ObjectId;
  status: OrderStatus;
  adress: {
    street: string;
    city: string;
    country: CountryCode;
    postalCode: string;
  };
  receiptEmail: string;
  note?: string;
  paymentMethod: PaymentMethod;
  couponId?: ObjectId;
}

export interface ShipmentDoc {
  id: string;
  orderId: ObjectId;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
}

export interface PaymentDoc {
  id: string;
  orderId: ObjectId;
  paymentMethod: PaymentMethod;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
}
