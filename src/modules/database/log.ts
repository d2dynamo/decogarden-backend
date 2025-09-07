import type { LogLayer } from "./types";
import connectCollection, { stringToObjectId } from "./mongo";
import type { LogDoc } from "global/interfaces/database";
import type { WithId } from "mongodb";

const create: LogLayer["create"] = async (data) => {
  const coll = await connectCollection("logs");

  const ind = { ...data, createdAt: new Date() };

  return await coll.insertOne(ind);
};

const list: LogLayer["list"] = async (filter, opts) => {
  const coll = await connectCollection("logs");

  const query: any = {};

  if (filter?.userId) {
    const uoid = stringToObjectId(filter.userId);
    if (uoid) {
      query.userId = uoid;
    }
  }

  if (filter?.level) {
    query.level = filter.level;
  }

  if (filter?.type) {
    query.type = filter.type;
  }

  if (filter?.dateFrom || filter?.dateTo) {
    query.createdAt = {};
    if (filter.dateFrom) {
      query.createdAt.$gte = new Date(filter.dateFrom);
    }
    if (filter.dateTo) {
      query.createdAt.$lte = new Date(filter.dateTo);
    }
  }

  const result = await coll.find(query, {
    ...opts,
    sort: opts?.sort || { createdAt: -1 },
  });

  const logs: WithId<LogDoc>[] = [];

  while (await result.hasNext()) {
    const log = await result.next();
    if (!log || !log._id) {
      continue;
    }

    logs.push(log);
  }

  return logs;
};

const get: LogLayer["get"] = async (id) => {
  const uoid = stringToObjectId(id);
  if (!uoid) {
    throw new Error(`invalid logId: ${id}`);
  }

  const coll = await connectCollection("logs");

  return await coll.findOne({ _id: uoid });
};

export default { create, get, list } as LogLayer;
