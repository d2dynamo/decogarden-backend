import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test";
import { Request, Response } from "express";
import { getItemController } from "../src/controllers/item";
import addItem from "../src/modules/items/create";

let validItemId = "";

const validItem = {
  title: "Unit Test",
  description: "Item Description",
  price: 100,
  properties: { height: 100 },
  amountStorage: 10,
  active: true,
};

const validItemReturn = {
  title: "Unit Test",
  description: "Item Description",
  price: 100,
  properties: { height: 100 },
  amountStorage: 10,
  active: true,
  createdAt: expect.any(Number),
  updatedAt: expect.any(Number),
};

const invalidItemId = "66a121cec326";
const itemIdNotFound = "66a121cec32666a121cec326";

describe("getItemController", async () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: Function;

  validItemId = await addItem(validItem);

  beforeEach(() => {
    req = { params: {} };
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

    console.log = mock(() => {});
  });

  it("check valid request", async () => {
    req.params = { id: validItemId };

    await getItemController(req as Request, res as Response, next);

    expect(res.locals).toEqual({
      error: false,
      code: 200,
      message: "success",
      payload: {
        item: validItemReturn,
      },
    });
    expect(next).toHaveBeenCalled();
  });

  it("check invalid item id", async () => {
    req.params = { id: invalidItemId };

    await getItemController(req as Request, res as Response, next);

    expect(res.locals).toEqual({
      error: true,
      code: 400,
      message: "item id invalid",
    });
    expect(next).toHaveBeenCalled();
  });

  it("check item not found", async () => {
    req.params = { id: itemIdNotFound };

    await getItemController(req as Request, res as Response, next);

    expect(res.locals).toEqual({
      error: true,
      code: 404,
      message: "item not found",
    });
    expect(next).toHaveBeenCalled();
  });
});
