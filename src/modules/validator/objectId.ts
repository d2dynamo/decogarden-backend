import { stringToObjectIdSync } from "modules/database/mongo";
import type { ObjectIdValidateOpts } from "./types";
import type { ObjectId } from "mongodb";

function objectIdValidator(val: any, options?: ObjectIdValidateOpts) {
  if (typeof val !== "string") {
    return { value: false, error: "Invalid document id, must be a string." };
  }

  let objectId = stringToObjectIdSync(val);
  if (!objectId) {
    return { value: false, error: "Failed to serialize document id." };
  }

  return objectId as ObjectId;
}

export default objectIdValidator;
