/**
 * Default MongoDB projections for database layers.
 * These projections exclude sensitive fields by default for security.
 * To include sensitive fields, explicitly override in the projection options.
 */

// User projections.
export const USER_SECURE_PROJECTION = {
  hash: 0,
  authSecret: 0,
  createdAt: 0,
  updatedAt: 0,
  lastLoginAttempt: 0,
} as const;

export const USER_LIST_PROJECTION = {
  _id: 1,
  userName: 1,
  email: 1,
  emailVerify: 1,
} as const;

export const USER_PUBLIC_PROJECTION = {
  _id: 1,
  userName: 1,
  email: 1,
} as const;

// Item projections
export const ITEM_LIST_PROJECTION = {
  _id: 1,
  title: 1,
  price: 1,
  amountStorage: 1,
  active: 1,
} as const;

export const ITEM_FULL_PROJECTION = {
  _id: 1,
  title: 1,
  description: 1,
  price: 1,
  properties: 1,
  amountStorage: 1,
  active: 1,
} as const;

// User Permission projections
export const USER_PERMISSION_PROJECTION = {
  _id: 0,
  userId: 1,
  permissions: 1,
  "permissions.id": 1,
  "permissions.active": 1,
  "permissions.createdAt": 1,
  "permissions.updatedAt": 1,
} as const;
