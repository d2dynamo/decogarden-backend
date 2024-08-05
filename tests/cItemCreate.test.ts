import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test";
import { Request, Response } from "express";
import { createItemController } from "../src/controllers/item";
import { UserError } from "../src/util/error";

const validBody = {
  title: "Item Title",
  description: "Item Description",
  price: 100,
  properties: { key: "value" },
  amountStorage: 10,
  active: true,
};

const missingRequiredBody = {
  title: null,
  price: null,
};

const invalidItemBody = {
  title: 123,
  price: "name",
};

const addItemPath = "../src/modules/items/create";

mock.module(addItemPath, async () => true);

// NOTE: controllers first check if any required fields are missing before running the coresponding db function.
// So make sure to add required fields to the request object in the tests if you need to test beyond data validation.

describe("createItemController", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: Function;

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
  });

  afterEach(() => {
    mock.restore();
  });

  it("should return 400 if title or price validation fails", async () => {
    req.body = missingRequiredBody;

    await createItemController(req as Request, res as Response, next);

    expect(res.locals).toEqual({
      error: true,
      code: 400,
      message: "missing required fields",
      payload: {
        errors: {
          title: expect.any(String),
          price: expect.any(String),
        },
      },
    });
    expect(next).toHaveBeenCalled();
  });

  it("add valid item and return 200", async () => {
    req.body = validBody;

    await createItemController(req as Request, res as Response, next);

    expect(res.locals).toEqual({
      error: false,
      code: 200,
      message: "success",
      payload: {},
    });
    expect(next).toHaveBeenCalled();
  });

  it("handle UserError", async () => {
    mock.module(addItemPath, () => {
      return {
        addItem: async (newItem: any) => {
          throw new UserError("User error message", 401);
        },
      };
    });

    req.body = validBody;

    await createItemController(req as Request, res as Response, next);

    expect(res.locals).toEqual({
      error: true,
      code: 401,
      message: "User error message",
      payload: {},
    });
    expect(next).toHaveBeenCalled();
  });

  it("handle code/server error", async () => {
    mock.module(addItemPath, () => {
      return {
        addItem: async (newItem: any) => {
          throw new Error("Some code/server error");
        },
      };
    });

    req.body = validBody;

    await createItemController(req as Request, res as Response, next);

    expect(res.locals).toEqual({
      error: true,
      code: 500,
      message: "internal server error",
      payload: {},
    });
    expect(next).toHaveBeenCalled();
  });
});
