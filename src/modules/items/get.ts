import type { ObjectId } from "mongodb";
import type { ListOptions } from "../../global/interfaces/controller";
import connectCollection, { stringToObjectId } from "../database/mongo";
import { UserError } from "../../util/error";
import type {
  ListItemFilter,
  ListItemSorts,
} from "../../global/interfaces/item";

interface ItemInList {
  id: string;
  title: string;
  price: number; // float in euro
  amountStorage: number;
}

export async function listItems(
  filter?: ListItemFilter,
  listOpts?: ListOptions<ListItemSorts>
): Promise<ItemInList[]> {
  const coll = await connectCollection("items");

  const query: any = {};

  if (filter?.title) {
    query.title = { $regex: filter.title, $options: "i" };
  }
  if (filter?.priceGte !== undefined) {
    query.price = query.price || {};
    query.price.$gte = filter.priceGte;
  }
  if (filter?.priceLte !== undefined) {
    query.price = query.price || {};
    query.price.$lte = filter.priceLte;
  }

  const sort: any = {};
  if (listOpts?.sort) {
    const keys = Object.keys(listOpts.sort);

    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      sort[k] = listOpts.sort[k];
    }
  }

  const projection: any = {
    _id: 1,
    title: 1,
    price: 1,
    amountStorage: 1,
  };

  const page = listOpts?.page || 1;
  const pageSize = listOpts?.pageSize || 10;
  const skip = (page - 1) * pageSize;

  const cursor = coll
    .find(query, { projection })
    .sort(sort)
    .skip(skip)
    .limit(pageSize);

  const items: ItemInList[] = [];
  while (await cursor.hasNext()) {
    const doc = await cursor.next();

    if (!doc || !doc._id) {
      continue;
    }

    if (!doc.price) {
      console.log(`Item missing price: ${doc._id}`);
      continue;
    }

    items.push({
      id: doc._id.toString(),
      title: doc.title || "unknown item",
      price: doc.price,
      amountStorage: doc.amountStorage || 0,
    });
  }

  return items;
}

interface ItemReturn {
  id: string;
  title: string;
  description: string;
  price: number;
  properties?: { [key: string]: any };
  amountStorage: number;
  createdAt: number;
  updatedAt: number;
}

export async function getItem(itemId: ObjectId | string) {
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
    createdAt: item.createdAt.getTime(),
    updatedAt: item.updatedAt.getTime(),
  };
}
