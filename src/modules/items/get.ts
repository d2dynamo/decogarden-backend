import connectCollection, { stringToObjectId } from '../database/mongo';
import { UserError } from '../../util/error';
import type { FGetItem, FGetItemBasic, Item } from './types';
import type { ObjectId } from 'mongodb';

const getItem: FGetItem = async (id: ObjectId | string) => {
  const itemObjId = await stringToObjectId(id);

  if (!itemObjId) {
    throw new Error('Invalid itemId');
  }

  const coll = await connectCollection('items');

  const item = await coll.findOne(
    { _id: itemObjId },
    { projection: { _id: 0 } }
  );

  if (!item) {
    throw new UserError('item not found', 404);
  }

  if (!item.price) {
    throw new Error(`item missing price: ${item.price}`);
  }

  return {
    title: item.title || 'unknown item',
    description: item.description || '',
    price: item.price,
    properties: item.properties,
    amountStorage: item.amountStorage || 0,
    active: item.active || false,
    createdAt: item.createdAt?.getTime() || 0,
    updatedAt: item.updatedAt?.getTime() || 0,
  };
};

const getItemBasic: FGetItemBasic = async (id: ObjectId | string) => {
  const itemObjId = await stringToObjectId(id);
  if (!itemObjId) {
    throw new Error(`Invalid itemId: ${id}`);
  }

  const coll = await connectCollection('items');

  const item = await coll.findOne(
    { _id: itemObjId },
    { projection: { title: 1, price: 1 } }
  );

  if (!item) {
    throw new UserError(`Item does not exist`, 404);
  }

  return {
    title: item.title,
    price: item.price,
  };
};

export { getItem, getItemBasic };
