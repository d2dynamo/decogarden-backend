import type { ErrorsDesc, ObjectValidateOpts } from ".";

export default function sortValidator(
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
      ] = `object property count out of range (${minProps}-${maxProps})`;
      return false;
    }

    if (val.hasOwnProperty(key) && val[key] !== 1 && val[key] !== -1) {
      errs.sort = {
        ...(errs.sort as object),
        [key]: "invalid sort value, must be 1 or -1",
      };
    }
  }

  if (minProps !== undefined && amountProps < minProps) {
    errs[
      fieldName
    ] = `object property count out of range (${minProps}-${maxProps})`;
    return false;
  }

  return val as object;
}
