import { UserError } from "util/error";
import type { FSetItem } from "./types";
import { itemLayer } from "modules/database";

const updateItem: FSetItem = async (id, input) => {
  const result = await itemLayer.update(id, {
    $set: {
      ...input,
      updatedAt: new Date(),
    },
  });

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
