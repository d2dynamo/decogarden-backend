import type { ErrorsDesc, ValidateOptions } from "./index";

export default async function booleanValidator(
  val: any,
  fieldName: string,
  errs: ErrorsDesc,
  options?: ValidateOptions
): Promise<boolean | false> {
  if (options?.required && (val === undefined || val === null)) {
    errs[fieldName] = "missing required field";
    return false;
  }

  const isBoolean = typeof val === "boolean";
  if (!isBoolean) {
    errs[fieldName] = "expected boolean";
    return false;
  }

  return val;
}
