import connectCollection from '../database/mongo';
import type { FListPermissions, Permission } from './types';

const listPermissions: FListPermissions = async (
  showInactive: boolean = false
) => {
  const coll = await connectCollection('permissions');

  const q: any = {};

  if (!showInactive) {
    q.active = true;
  }

  const cursor = coll.find(q);

  const perms: Permission[] = [];

  while (await cursor.hasNext()) {
    const item = await cursor.next();

    if (!item || !item._id) {
      continue;
    }

    perms.push({
      id: String(item._id),
      name: item.name || 'unknown permission',
      active: item.active || false,
      createdAt: item.createdAt.getTime(),
      updatedAt: item.updatedAt.getTime(),
    });
  }

  return perms;
};

export default listPermissions;
