import type { ListOptions } from '../../global/interfaces/controller';
import connectCollection from '../database/mongo';
import type {
  FListItems,
  ListItem,
  ListItemFilter,
  ListItemSorts,
} from './types';

const listItems: FListItems = async (
  filter?: ListItemFilter,
  listOpts?: ListOptions<ListItemSorts>
) => {
  const coll = await connectCollection('items');

  const query: any = {};

  if (filter?.title) {
    query.title = { $regex: filter.title, $options: 'i' };
  }
  if (filter?.priceGte !== undefined) {
    query.price = { $gte: filter.priceGte };
  }
  if (filter?.priceLte !== undefined) {
    query.price = query.price ?? {};
    query.price.$lte = filter.priceLte;
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
    .sort(listOpts?.sort || { createdAt: -1 })
    .skip(skip)
    .limit(pageSize);

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
      title: doc.title || 'unknown item',
      price: doc.price,
      amountStorage: doc.amountStorage || 0,
    });
  }

  return items;
};

export default listItems;
