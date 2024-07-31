import type { ErrorsDesc, ValidateOptions } from "./index";

export default function booleanValidator(
  val: any,
  fieldName: string,
  errs: ErrorsDesc,
  options?: ValidateOptions
): boolean | false {
  if (options?.required && (val === undefined || val === null)) {
    errs[fieldName] = "missing required field";
    return false;
  }

  if (val !== undefined && typeof val !== "boolean") {
    errs[fieldName] = "expected boolean";
    return false;
  }

  return val;
}
