import type { AddItem } from "../../global/interfaces/item";
import connectCollection from "../database/mongo";

/** Inserts new item. If failed to insert throws error.
 *
 * @param newItem {AddItem}
 * @returns inserted item id
 */
export async function addItem(newItem: AddItem): Promise<string> {
  console.log("addItem called", newItem);
  const coll = await connectCollection("items");

  const insertDoc = {
    ...newItem,
    createdAt: new Date(),
    updatedAt: new Date(),
    amountStorage: newItem.amountStorage ?? 0,
    active: newItem.active ?? false,
  };

  const result = await coll.insertOne(insertDoc);

  if (!result.acknowledged) {
    throw new Error("failed to insert item");
  }

  return result.insertedId.toString();
}
