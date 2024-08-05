import { describe, it, expect, beforeEach, mock } from "bun:test";
import { Request, Response } from "express";
import { updateItemController } from "../src/controllers/item";
import { addItem } from "../src/modules/items/create";

const validItem = {
  title: "Item Title",
  description: "Item Description",
  price: 100,
  properties: { key: "value" },
  amountStorage: 10,
  active: false,
};

const validBody = {
  id: "",
  ...validItem,
};

const invalidItem = {
  title: 123,
  price: "name",
  properties: "not an object",
  active: "not a boolean",
};

const invalidBody = {
  id: "",
  ...invalidItem,
};

const invalidItemIdBody = {
  id: "66a121cec326",
  title: "Item Title",
  price: 120,
  properties: { width: 200 },
  amountStorage: 2,
  active: true,
};

describe("updateItemController", async () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: Function;

  validBody.id = await addItem(validItem);
  invalidBody.id = validBody.id;

  beforeEach(() => {
    req = { body: {} };
    res = {
      locals: {},
      status: function () {
        return this;
      },
      send: function () {
        return this;
      },
    };
    next = mock(() => {});

    // prevent controller from logging on catch Error
    console.log = mock(() => {});
  });

  it("check valid request", async () => {
    req.body = validBody;

    await updateItemController(req as Request, res as Response, next);

    expect(res.locals).toEqual({
      error: false,
      code: 200,
      message: "success",
      payload: {},
    });
    expect(next).toHaveBeenCalled();
  });

  it("check invalid data", async () => {
    req.body = invalidBody;

    await updateItemController(req as Request, res as Response, next);

    expect(res.locals).toEqual({
      error: false,
      code: 200,
      message: "success",
      payload: {
        errors: {
          price: expect.any(String),
          title: expect.any(String),
          properties: expect.any(String),
          active: expect.any(String),
        },
      },
    });
    expect(next).toHaveBeenCalled();
  });

  it("check invalid item id", async () => {
    req.body = invalidItemIdBody;

    await updateItemController(req as Request, res as Response, next);

    expect(res.locals).toEqual({
      error: true,
      code: 400,
      message: "invalid item id",
      payload: {
        errors: {
          id: expect.any(String),
        },
      },
    });
    expect(next).toHaveBeenCalled();
  });
});
