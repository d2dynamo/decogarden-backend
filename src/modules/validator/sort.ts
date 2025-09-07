import { DataValidationError } from "../../util/error";
import { type SortValidateOpts } from "./types";
import { ErrorMessage } from "./util";

type ValidatorReturn = {
  validSort: { [key: string]: 1 | -1 };
  errors?: { [key: string]: string };
};

function sortValidator(val: any, options?: SortValidateOpts): ValidatorReturn {
  if (typeof val === "string") {
    // for stringified query. Ex: "createdAt:1"
    const parts = val.split(":");
    if (parts.length === 2) {
      const key = parts[0];
      const order = parts[1] === "1" ? 1 : -1;
      return {
        validSort: { [key]: order },
      };
    }
  }
  const isObject = val !== null && typeof val === "object";
  if (!isObject) {
    throw new DataValidationError(ErrorMessage.expectedObject);
  }

  let minProps = 1,
    maxProps = 5;
  if (options) {
    options.minProps ? (minProps = options.minProps) : (minProps = 1);
    options.maxProps ? (maxProps = options.maxProps) : (maxProps = 5);
  }

  if (maxProps > 5) {
    maxProps = 5;
  }

  const returnObj: ValidatorReturn = {
    validSort: {},
  };

  let amountProps = 0;
  for (const key in val) {
    if (val.hasOwnProperty(key)) {
      amountProps++;
    }

    // Check max props here incase of excessive loop
    if (amountProps > maxProps || amountProps > 1000) {
      throw new DataValidationError(
        ErrorMessage.objectPropertyCountOutOfRange +
          `(min:${minProps} max:${maxProps})`
      );
    }

    if (val.hasOwnProperty(key) && val[key] !== 1 && val[key] !== -1) {
      if (!returnObj.errors) returnObj.errors = {};
      returnObj.errors[key] = "invalid sort value, must be 1 or -1";
    }

    returnObj.validSort[key] = val[key];
  }

  if (options?.required && amountProps < 1) {
    throw new DataValidationError(ErrorMessage.missingRequired);
  }

  if (amountProps < minProps) {
    throw new DataValidationError(
      ErrorMessage.objectPropertyCountOutOfRange +
        `(min:${minProps} max:${maxProps})`
    );
  }

  return returnObj;
}

export default sortValidator;
