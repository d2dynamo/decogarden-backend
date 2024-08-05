import { expect, test } from "bun:test";

import { dataValidator } from "../src/modules/validator";

/*
  DataValidator notes: 
  undefined and null should false but not error if not required.
  undefined and null should false and give error if required.
  incorrect type should give false and error even if not required.
*/

// STRING VALIDATOR
test("dataValidatorString", async () => {
  const errors: any = {};
  expect(await dataValidator("test", "test", "string", errors)).toBe("test");
  expect(errors).toEqual({});

  expect(
    await dataValidator(undefined, "testundef", "string", errors, {
      required: true,
    })
  ).toBe(false);
  expect(errors).toEqual({ testundef: "missing required field" });
  delete errors.testundef;

  expect(await dataValidator(123, "string", "string", errors)).toBe(false);
  expect(errors).toEqual({ string: "expected string" });
  delete errors.string;

  expect(await dataValidator(undefined, "undef", "array", errors)).toBe(false);
  expect(errors).toEqual({});
});

// NUMBER VALIDATOR
test("dataValidatorNumber", async () => {
  const errors: any = {};
  expect(await dataValidator(123, "test", "number", errors)).toBe(123);
  expect(errors).toEqual({});

  expect(await dataValidator(-1, "test", "number", errors)).toBe(false);
  expect(errors).toEqual({ test: "number out of range (0-999999999)" });
  delete errors.test;

  // dataValidator can convert stringified numbers to numbers
  expect(await dataValidator("123", "test", "number", errors)).toBe(123);
  expect(errors).toEqual({});

  expect(await dataValidator("test", "test", "number", errors)).toBe(false);
  expect(errors).toEqual({ test: "invalid number" });
  delete errors.test;

  expect(
    await dataValidator(undefined, "undef", "number", errors, {
      required: true,
    })
  ).toBe(false);
  expect(errors).toEqual({ undef: "missing required field" });
  delete errors.undef;

  expect(await dataValidator(undefined, "undef", "array", errors)).toBe(false);
  expect(errors).toEqual({});
});

// ARRAY VALIDATOR
test("dataValidatorArray", async () => {
  const errors: any = {};
  expect(await dataValidator([1, 2, 3], "test", "array", errors)).toEqual([
    1, 2, 3,
  ]);
  expect(errors).toEqual({});

  expect(await dataValidator(123, "test", "array", errors)).toBe(false);
  expect(errors).toEqual({ test: "expected array" });
  delete errors.test;

  expect(
    await dataValidator(undefined, "undef", "array", errors, { required: true })
  ).toBe(false);
  expect(errors).toEqual({ undef: "missing required field" });
  delete errors.undef;

  expect(await dataValidator(undefined, "undef", "array", errors)).toBe(false);
  expect(errors).toEqual({});
});

// BOOLEAN VALIDATOR
test("dataValidatorBoolean", async () => {
  const errors: any = {};
  expect(await dataValidator(true, "test", "boolean", errors)).toBe(true);
  expect(errors).toEqual({});

  expect(
    await dataValidator(false, "test", "boolean", errors, { required: true })
  ).toBe(false);
  expect(errors).toEqual({});

  expect(await dataValidator(123, "test", "boolean", errors)).toBe(false);
  expect(errors).toEqual({ test: "expected boolean" });
  delete errors.test;

  expect(
    await dataValidator(undefined, "undef", "boolean", errors, {
      required: true,
    })
  ).toBe(false);
  expect(errors).toEqual({ undef: "missing required field" });
  delete errors.undef;
});

// OBJECT VALIDATOR
test("dataValidatorObject", async () => {
  const errors: any = {};
  expect(
    await dataValidator({ test: "test" }, "test", "object", errors)
  ).toEqual({ test: "test" });
  expect(errors).toEqual({});

  expect(await dataValidator(123, "test", "object", errors)).toBe(false);
  expect(errors).toEqual({ test: "expected object" });
  delete errors.test;

  expect(
    await dataValidator(
      { test: 1, test2: 2, test3: 3 },
      "test",
      "object",
      errors,
      { minProps: 1, maxProps: 2 }
    )
  ).toBe(false);
  expect(errors).toEqual({
    test: "object property count out of range (min:1 max:2)",
  });
  delete errors.test;

  expect(
    await dataValidator(undefined, "undef", "object", errors, {
      required: true,
    })
  ).toBe(false);
  expect(errors).toEqual({ undef: "missing required field" });
  delete errors.undef;

  expect(await dataValidator(undefined, "undef", "array", errors)).toBe(false);
  expect(errors).toEqual({});
});

// SORT VALIDATOR
test("dataValidatorSort", async () => {
  const errors: any = {};
  expect(
    await dataValidator({ test: 1, test2: -1 }, "test", "sort", errors)
  ).toEqual({
    test: 1,
    test2: -1,
  });
  expect(errors).toEqual({});

  expect(await dataValidator("123", "test", "sort", errors)).toBe(false);
  expect(errors).toEqual({ test: "expected object" });
  delete errors.test;

  expect(await dataValidator({ test: 2 }, "test", "sort", errors)).toEqual(
    false
  );
  expect(errors).toEqual({
    sort: { test: "invalid sort value, must be 1 or -1" },
  });
  delete errors.sort;

  expect(
    await dataValidator(undefined, "undef", "sort", errors, {
      required: true,
    })
  ).toBe(false);
  expect(errors).toEqual({ undef: "missing required field" });
  delete errors.undef;

  expect(await dataValidator(undefined, "undef", "array", errors)).toBe(false);
  expect(errors).toEqual({});
});
