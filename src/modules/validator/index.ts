// type ErrorsDesc = { [key: string]: string | object };

// interface ValidateOptions {
//   required?: boolean;
// }

// type ExpectType = "number" | "string" | "object" | "array" | "boolean";

// interface ValidateNumberOpts extends ValidateOptions {
//   min?: number;
//   max?: number;
// }

// interface ValidateStringOpts extends ValidateOptions {
//   minLength?: number;
//   maxLength?: number;
// }

// interface ValidateArrayOpts extends ValidateOptions {
//   minLength?: number;
//   maxLength?: number;
// }

// type ValidatorOptions<T extends ExpectType> =
//   T extends "number" ? ValidateNumberOpts :
//   T extends "string" ? ValidateStringOpts :
//   T extends "array" ? ValidateArrayOpts :
//   ValidateOptions;

// // Overloads
// async function dataValidator(
//   val: any,
//   fieldName: string,
//   expect: "number",
//   errs: ErrorsDesc,
//   options: ValidateNumberOpts
// ): Promise<number | false>;

// async function dataValidator(
//   val: any,
//   fieldName: string,
//   expect: "string",
//   errs: ErrorsDesc,
//   options: ValidateStringOpts
// ): Promise<string | false>;

// async function dataValidator(
//   val: any,
//   fieldName: string,
//   expect: "array",
//   errs: ErrorsDesc,
//   options: ValidateArrayOpts
// ): Promise<any[] | false>;

// async function dataValidator(
//   val: any,
//   fieldName: string,
//   expect: "boolean" | "object",
//   errs: ErrorsDesc,
//   options: ValidateOptions
// ): Promise<boolean | object | false>;

// // Implementation
// async function dataValidator<T extends ExpectType>(
//   val: any,
//   fieldName: string,
//   expect: T,
//   errs: ErrorsDesc,
//   options: ValidatorOptions<T>
// ): Promise<any | false> {
//   if (options.required && (val === undefined || val === null)) {
//     errs[fieldName] = "missing required field";
//     return false;
//   }

//   if (expect === "number") {
//     const { max, min } = options as ValidateNumberOpts;
//     const isNumber = typeof val === "number" && !isNaN(val);

//     if (!isNumber) {
//       errs[fieldName] = "expected number";
//       return false;
//     }

//     if ((min !== undefined && val < min) || (max !== undefined && val > max)) {
//       errs[fieldName] = `number out of range (${min}-${max})`;
//       return false;
//     }

//     return val;

//   } else if (expect === "string") {
//     const { minLength, maxLength } = options as ValidateStringOpts;
//     const isString = typeof val === "string";

//     if (!isString) {
//       errs[fieldName] = "expected string";
//       return false;
//     }

//     if ((minLength !== undefined && val.length < minLength) || (maxLength !== undefined && val.length > maxLength)) {
//       errs[fieldName] = `string length out of range (${minLength}-${maxLength})`;
//       return false;
//     }

//     return val;

//   } else if (expect === "array") {
//     const { minLength, maxLength } = options as ValidateArrayOpts;
//     const isArray = Array.isArray(val);

//     if (!isArray) {
//       errs[fieldName] = "expected array";
//       return false;
//     }

//     if ((minLength !== undefined && val.length < minLength) || (maxLength !== undefined && val.length > maxLength)) {
//       errs[fieldName] = `array length out of range (${minLength}-${maxLength})`;
//       return false;
//     }

//     return val;

//   } else if (expect === "boolean") {
//     const isBoolean = typeof val === "boolean";

//     if (!isBoolean) {
//       errs[fieldName] = "expected boolean";
//       return false;
//     }

//     return val;

//   } else if (expect === "object") {
//     const isObject = typeof val === "object" && val !== null;

//     if (!isObject) {
//       errs[fieldName] = "expected object";
//       return false;
//     }

//     return val;

//   } else {
//     throw new Error(`invalid expected type in dataValidator: ${expect}`);
//   }
// }

// export default dataValidator;

export type ErrorsDesc = { [key: string]: string | object };

export interface ValidateOptions {
  required?: boolean;
}

export interface ValidateNumberOpts extends ValidateOptions {
  /** default 0 */
  min?: number;
  /** default 999999999 */
  max?: number;
}

export interface ValidateStringOpts extends ValidateOptions {
  /** default 1 */
  minLength?: number;
  /** default 999 */
  maxLength?: number;
}

export interface ValidateArrayOpts extends ValidateOptions {
  /** default 1 */
  minLength?: number;
  /** default 1000 */
  maxLength?: number;
  contains?: ExpectType | "any";
}

export interface ValidateObjectOpts extends ValidateOptions {
  /** default 1 */
  minProps?: number;
  /** default 1000 */
  maxProps?: number;
}

export type ExpectType = "number" | "string" | "object" | "array" | "boolean";

export type ValidatorOptions<T extends ExpectType> = T extends "number"
  ? ValidateNumberOpts
  : T extends "string"
  ? ValidateStringOpts
  : T extends "array"
  ? ValidateArrayOpts
  : T extends "object"
  ? ValidateObjectOpts
  : ValidateOptions;

import numberValidator from "./number";
import stringValidator from "./string";
import arrayValidator from "./array";
import booleanValidator from "./boolean";
import objectValidator from "./object";

/**
 *
 * @param val variable to validate
 * @param fieldName name of variable for storing error
 * @param expect expected type of variable
 * @param errs errs object. If val is not undefined but is incorrect type, will store error message here.
 * @param options
 * @returns false if val is not of expected type or is undefined. val otherwise.
 */
export async function dataValidator<ET extends ExpectType>(
  val: any,
  fieldName: string,
  expect: ET,
  errs: ErrorsDesc,
  options?: ValidatorOptions<ET>
): Promise<
  ET extends "number"
    ? number | false
    : ET extends "string"
    ? string | false
    : ET extends "array"
    ? any[] | false
    : ET extends "boolean"
    ? boolean | false
    : ET extends "object"
    ? object | false
    : false
> {
  switch (expect) {
    case "number":
      return numberValidator(val, fieldName, errs, options || {}) as any;
    case "string":
      return stringValidator(val, fieldName, errs, options || {}) as any;
    case "array":
      return arrayValidator(val, fieldName, errs, options || {}) as any;
    case "boolean":
      return booleanValidator(val, fieldName, errs, options || {}) as any;
    case "object":
      return objectValidator(val, fieldName, errs, options || {}) as any;
    default:
      throw new Error(`invalid expected type in dataValidator: ${expect}`);
  }
}
