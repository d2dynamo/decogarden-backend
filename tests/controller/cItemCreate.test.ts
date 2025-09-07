import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test";
import type { Request, Response } from "express";

import { createItemController } from "controllers/item";

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
  properties: "not an object",
  active: "not a boolean",
};

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
    };
    next = mock(() => {});

    // prevent controller from logging on catch Error
    console.log = mock(() => {});
  });

  it("check valid request", async () => {
    req.body = validBody;

    await createItemController(req as Request, res as Response, next);

    expect(res.locals).toEqual({
      error: false,
      code: 200,
      message: "success",
      payload: {
        insertedId: expect.any(String),
      },
    });
    expect(next).toHaveBeenCalled();
  });

  it("check missing required fields", async () => {
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

  it("check invalid fields", async () => {
    req.body = invalidItemBody;

    await createItemController(req as Request, res as Response, next);

    expect(res.locals).toEqual({
      error: true,
      code: 400,
      message: "missing required fields",
      payload: {
        errors: {
          title: expect.any(String),
          price: expect.any(String),
          properties: expect.any(String),
          active: expect.any(String),
        },
      },
    });
    expect(next).toHaveBeenCalled();
  });
});
