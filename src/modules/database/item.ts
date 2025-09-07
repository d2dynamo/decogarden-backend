import { ITEM_FULL_PROJECTION, ITEM_LIST_PROJECTION } from "global/const";
import connectCollection, { stringToObjectId } from "./mongo";
import type { ItemLayer, ListItemDoc } from "./types";

const create: ItemLayer["create"] = async (data) => {
  const coll = await connectCollection("items");

  const ind = { ...data, createdAt: new Date(), updatedAt: new Date() };

  return await coll.insertOne(ind);
};

const get: ItemLayer["get"] = async (id, opts) => {
  const uoid = await stringToObjectId(id);

  if (!uoid) {
    throw new Error(`invalid itemId: ${id}`);
  }

  const coll = await connectCollection("items");

  const projection = opts?.projection
    ? { ...ITEM_FULL_PROJECTION, ...opts.projection }
    : ITEM_FULL_PROJECTION;

  return await coll.findOne(
    { _id: uoid },
    {
      ...opts,
      projection,
    }
  );
};

const list: ItemLayer["list"] = async (filter, opts) => {
  const coll = await connectCollection("items");

  const projection = opts?.projection
    ? { ...ITEM_LIST_PROJECTION, ...opts.projection }
    : ITEM_LIST_PROJECTION;

  const result = await coll.find(filter || {}, {
    ...opts,
    projection,
  });

  const items: ListItemDoc[] = [];

  while (await result.hasNext()) {
    const item = await result.next();
    if (!item || !item._id) {
      continue;
    }

    items.push({
      _id: item._id.toHexString(),
      title: item.title,
      price: item.price,
      amountStorage: item.amountStorage || 0,
    });
  }

  return items;
};

const cursor: ItemLayer["cursor"] = async (filter, opts) => {
  const coll = await connectCollection("items");

  const projection = opts?.projection
    ? { ...ITEM_LIST_PROJECTION, ...opts.projection }
    : ITEM_LIST_PROJECTION;

  return coll.find(filter || {}, { ...opts, projection });
};

const update: ItemLayer["update"] = async (id, update) => {
  const uoid = await stringToObjectId(id);

  if (!uoid) {
    throw new Error(`invalid itemId: ${id}`);
  }

  const coll = await connectCollection("items");

  return await coll.updateOne({ _id: uoid }, update);
};

export default { create, get, list, cursor, update } as ItemLayer;
