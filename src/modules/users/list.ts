import type { FListUsers } from "./types";
import { userLayer } from "modules/database";

const listUsers: FListUsers = async (filter, options) => {
  const query: any = {
    archivedAt: { $exists: false },
  };

  if (filter.userName) {
    query.userName = { $regex: filter.userName, $options: "i" };
  }
  if (filter.email) {
    query.email = { $regex: filter.email, $options: "i" };
  }
  if (filter.mustBeVerified) {
    query.emailVerify = true;
  }

  const projection: any = {
    _id: 1,
    userName: 1,
    email: 1,
  };

  const users = userLayer.list(query, {
    projection,
    skip: options.pagination.skip,
    limit: options.pagination.limit,
    sort: options.sort || { createdAt: 1 },
  });

  return users;
};

export default listUsers;
