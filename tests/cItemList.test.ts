import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test";
import { Request, Response } from "express";
import { listItemsController } from "../src/controllers/item";
import addItem from "../src/modules/items/create";

const validAllBody = {
  page: 1,
  pageSize: 10,
};

const validTitleBody = {
  title: "filteritem",
  page: 1,
  pageSize: 10,
};

const validPriceBody = {
  priceGte: 100,
  priceLte: "200",
  page: 1,
  pageSize: 10,
};

const validSortBody = {
  sort: { price: 1 },
  page: 1,
  pageSize: 10,
};

const invalidSortBody = {
  sort: { price: "asc" },
  page: 1,
  pageSize: 10,
};

describe("listItemController", async () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: Function;

  await addItem({
    title: "testitem1",
    description: "Item Description",
    price: 50.0,
    properties: { height: 100 },
    amountStorage: 10,
    active: true,
  });
  await addItem({
    title: "testitem2",
    description: "Item Description",
    price: 590.59,
    properties: { height: 100 },
    amountStorage: 10,
    active: true,
  });

  beforeEach(() => {
    req = { body: {} };
    res = {
      locals: {},
      send: function () {
        return this;
      },
    };
    next = mock(() => {});

    console.log = mock(() => {});
  });

  it("check valid request", async () => {
    req.body = validAllBody;

    await listItemsController(req as Request, res as Response, next);

    expect(res.locals).toEqual({
      error: false,
      code: 200,
      message: "success",
      payload: {
        items: expect.any(Array),
      },
    });
    expect(next).toHaveBeenCalled();
  });

  it("check valid filter by title", async () => {
    req.body = validTitleBody;

    await listItemsController(req as Request, res as Response, next);

    expect(res.locals).toEqual({
      error: false,
      code: 200,
      message: "success",
      payload: {
        items: expect.any(Array),
      },
    });
    expect(next).toHaveBeenCalled();
  });

  it("check invalid filter by title", async () => {
    req.body = { title: 123, page: 1, pageSize: 10 };

    await listItemsController(req as Request, res as Response, next);

    expect(res.locals).toEqual({
      error: false,
      code: 200,
      message: "success",
      payload: {
        items: expect.any(Array),
        errors: { title: expect.any(String) },
      },
    });
  });

  it("check valid filter by price", async () => {
    req.body = validPriceBody;

    await listItemsController(req as Request, res as Response, next);

    expect(res.locals).toEqual({
      error: false,
      code: 200,
      message: "success",
      payload: {
        items: expect.any(Array),
      },
    });
    expect(next).toHaveBeenCalled();
  });

  it("check invalid filter by price", async () => {
    req.body = { priceGte: "xxx", priceLte: "yyy", page: 1, pageSize: 10 };

    await listItemsController(req as Request, res as Response, next);

    expect(res.locals).toEqual({
      error: false,
      code: 200,
      message: "success",
      payload: {
        items: expect.any(Array),
        errors: { priceGte: expect.any(String), priceLte: expect.any(String) },
      },
    });
  });

  it("check valid sort", async () => {
    req.body = validSortBody;

    await listItemsController(req as Request, res as Response, next);

    expect(res.locals).toEqual({
      error: false,
      code: 200,
      message: "success",
      payload: {
        items: expect.any(Array),
      },
    });
    expect(next).toHaveBeenCalled();
  });

  it("check invalid sort", async () => {
    req.body = invalidSortBody;

    await listItemsController(req as Request, res as Response, next);

    expect(res.locals).toEqual({
      error: false,
      code: 200,
      message: "success",
      payload: {
        items: expect.any(Array),
        errors: { sort: expect.any(Object) },
      },
    });
  });
});
