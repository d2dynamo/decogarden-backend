import type { ErrorsDesc, StringValidateOpts } from "./index";

export default function stringValidator(
  val: any,
  fieldName: string,
  errs: ErrorsDesc,
  options: StringValidateOpts
): string | false {
  if (options.required && (val === undefined || val === null)) {
    errs[fieldName] = "missing required field";
    return false;
  } else if (val === undefined || val === null) {
    return false;
  }

  const isString = typeof val === "string";
  if (!isString) {
    errs[fieldName] = "expected string";
    return false;
  }

  const { minLength = 1, maxLength = 999 } = options;
  if (
    (minLength !== undefined && val.length < minLength) ||
    (maxLength !== undefined && val.length > maxLength)
  ) {
    errs[fieldName] = `string length out of range (${minLength}-${maxLength})`;
    return false;
  }

  return val;
}
