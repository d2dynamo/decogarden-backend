import type { FCreateItem } from "./types";
import { itemLayer } from "modules/database";

const createItem: FCreateItem = async (input) => {
  const result = await itemLayer.create({
    ...input,
    amountStorage: input.amountStorage ?? 0,
    active: input.active ?? false,
  });

  if (!result.acknowledged) {
    throw new Error("failed to insert item");
  }

  return result.insertedId.toString();
};

export default createItem;
