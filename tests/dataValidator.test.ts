import { dataValidator } from "../src/modules/validator";

test("dataValidatorString", async () => {
  const errors: any = {};
  expect(await dataValidator("test", "test", "string", errors)).toBe("test");
  expect(errors).toEqual({});
  expect(
    await dataValidator(undefined, "undefined", "string", errors, {
      required: true,
    })
  ).toBe(false);
  expect(errors).toEqual({ test: "missing required field" });
  expect(await dataValidator(123, "string", "string", errors)).toBe(false);

  expect(await dataValidator(123, "number", "number", errors)).toBe(123);
  expect(errors).toEqual({});
  expect(await dataValidator("123", "number", "number", errors)).toBe(123);
  expect(errors).toEqual({});
});
