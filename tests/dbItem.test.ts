import { expect, test } from "bun:test";

import { addItem } from "../src/modules/items/create";
import { updateItem } from "../src/modules/items/update";
import { listItems, getItem } from "../src/modules/items/get";

test("addItem", async () => {
  const result = await addItem({
    title: "test",
    description: "test",
    price: 123,
  });
  expect(result).toBe(true);
});
