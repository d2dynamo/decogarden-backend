import type { ErrorsDesc, NumberValidateOpts } from "./index";

export default function numberValidator(
  val: any,
  fieldName: string,
  errs: ErrorsDesc,
  options: NumberValidateOpts
): number | false {
  if (options.required && (val === undefined || val === null)) {
    errs[fieldName] = "missing required field";
    return false;
  } else if (val === undefined || val === null) {
    return false;
  }

  const num = Number(val);
  if (isNaN(num)) {
    errs[fieldName] = "invalid number";
    return false;
  }

  if (!Number.isFinite(num)) {
    errs[fieldName] = "number must be finite";
    return false;
  }

  const { min = 0, max = 999999999 } = options;
  if ((min !== undefined && val < min) || (max !== undefined && val > max)) {
    errs[fieldName] = `number out of range (${min}-${max})`;
    return false;
  }

  return val;
}
