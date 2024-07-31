import type { ErrorsDesc, ValidateArrayOpts } from "./index";

export default async function arrayValidator(
  val: any,
  fieldName: string,
  errs: ErrorsDesc,
  options: ValidateArrayOpts
): Promise<any[] | false> {
  if (options.required && (val === undefined || val === null)) {
    errs[fieldName] = "missing required field";
    return false;
  } else if (val === undefined || val === null) {
    return false;
  }

  const isArray = Array.isArray(val);
  if (!isArray) {
    errs[fieldName] = "expected array";
    return false;
  }

  const { minLength = 1, maxLength = 1000 } = options;
  if (
    (minLength !== undefined && val.length < minLength) ||
    (maxLength !== undefined && val.length > maxLength)
  ) {
    errs[fieldName] = `array length out of range (${minLength}-${maxLength})`;
    return false;
  }

  return val;
}
