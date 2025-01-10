import connectCollection, { stringToObjectId } from '../database/mongo';
import { UserError } from '../../util/error';
import type { FSetItem } from './types';

const updateItem: FSetItem = async (input) => {
  const itemObjId = await stringToObjectId(input.id);

  if (!itemObjId) {
    throw new Error(`invalid item id: ${input.id}`);
  }
  delete input.id;

  const coll = await connectCollection('items');

  const result = await coll.updateOne(
    { _id: itemObjId },
    {
      $set: {
        ...input,
        updatedAt: new Date(),
      },
    }
  );

  if (!result.acknowledged) {
    throw new Error(`failed to update item`);
  }

  if (!result.matchedCount) {
    throw new UserError(`item does not exist.`, 404);
  }

  if (!result.modifiedCount) {
    throw new UserError(`no changes made.`, 204);
  }

  return true;
};

export default updateItem;
