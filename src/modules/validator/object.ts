import type { ErrorsDesc, ObjectValidateOpts } from "./index";

export default function objectValidator(
  val: any,
  fieldName: string,
  errs: ErrorsDesc,
  options: ObjectValidateOpts
): object | false {
  if (options.required && (val === undefined || val === null)) {
    errs[fieldName] = "missing required field";
    return false;
  } else if (val === undefined || val === null) {
    return false;
  }

  const isObject = val !== null && typeof val === "object";
  if (!isObject) {
    errs[fieldName] = "expected object";
    return false;
  }

  const { minProps = 1, maxProps = 1000 } = options;
  let amountProps = 0;

  for (const key in val) {
    if (val.hasOwnProperty(key)) {
      amountProps++;
    }

    if (maxProps !== undefined && amountProps > maxProps) {
      errs[
        fieldName
      ] = `object property count out of range (min:${minProps} max:${maxProps})`;
      return false;
    }
  }

  if (minProps !== undefined && amountProps < minProps) {
    errs[
      fieldName
    ] = `object property count out of range (min:${minProps} max:${maxProps})`;
    return false;
  }

  return val as object;
}
