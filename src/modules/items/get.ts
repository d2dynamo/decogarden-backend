import connectCollection, { stringToObjectId } from "../database/mongo";
import { UserError } from "../../util/error";
import type { Item } from "./types";
import type { ObjectId } from "mongodb";

export default async function getItem(
  itemId: ObjectId | string
): Promise<Omit<Item, "id">> {
  const itemObjId = await stringToObjectId(itemId);

  if (!itemObjId) {
    throw new Error("Invalid itemId");
  }

  const coll = await connectCollection("items");

  const item = await coll.findOne({ _id: itemObjId });

  if (!item) {
    throw new UserError("item not found", 404);
  }

  if (!item.price) {
    throw new Error(`item missing price: ${item.price}`);
  }

  return {
    title: item.title || "unknown item",
    description: item.description || "",
    price: item.price,
    properties: item.properties,
    amountStorage: item.amountStorage || 0,
    active: item.active || false,
    createdAt: item.createdAt?.getTime() || 0,
    updatedAt: item.updatedAt?.getTime() || 0,
  };
}
