import type { FCreateItem } from './types';
import connectCollection from '../database/mongo';

const createItem: FCreateItem = async (input) => {
  const coll = await connectCollection('items');

  const insertDoc = {
    ...input,
    createdAt: new Date(),
    updatedAt: new Date(),
    amountStorage: input.amountStorage ?? 0,
    active: input.active ?? false,
  };

  const result = await coll.insertOne(insertDoc);

  if (!result.acknowledged) {
    throw new Error('failed to insert item');
  }

  return result.insertedId.toString();
};

export default createItem;
