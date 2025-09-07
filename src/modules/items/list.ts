import { itemLayer } from "modules/database";
import type { FListItems, ListItem } from "./types";

const listItems: FListItems = async (filter, opts) => {
  const query: any = {};

  if (filter.title) {
    query.title = { $regex: filter.title, $options: "i" };
  }
  if (filter.priceGte !== undefined) {
    query.price = { $gte: filter.priceGte };
  }
  if (filter.priceLte !== undefined) {
    query.price = query.price ?? {};
    query.price.$lte = filter.priceLte;
  }

  const cursor = await itemLayer.cursor(query, {
    skip: opts.pagination.skip,
    limit: opts.pagination.limit,
    sort: opts.sort || { createdAt: -1 },
  });

  const items: ListItem[] = [];
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
};

export default listItems;
