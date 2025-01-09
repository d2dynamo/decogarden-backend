import { DataValidationError } from '../../util/error';
import { type SortValidateOpts } from './types';
import { ErrorMessage } from './util';

function sortValidator(
  val: any,
  options?: SortValidateOpts
): { validSort: { [key: string]: 1 | -1 }; errors: { [key: string]: string } } {
  const isObject = val !== null && typeof val === 'object';
  if (!isObject) {
    throw new DataValidationError(ErrorMessage.expectedObject);
  }

  let minProps = 1,
    maxProps = 1000;
  if (options) {
    options.minProps ? (minProps = options.minProps) : (minProps = 1);
    options.maxProps ? (maxProps = options.maxProps) : (maxProps = 1000);
  }

  if (maxProps > 1000) {
    maxProps = 1000;
  }

  const returnObj = {
    validSort: {},
    errors: {},
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
      returnObj.errors[key] = 'invalid sort value, must be 1 or -1';
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
