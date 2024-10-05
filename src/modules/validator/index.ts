export type ErrorsDesc = { [key: string]: string | object };

export interface ValidateOptions {
  required?: boolean;
  errorMsg?: string;
}

export interface NumberValidateOpts extends ValidateOptions {
  /** default 0 */
  min?: number;
  /** default 999999999 */
  max?: number;
}

export interface StringValidateOpts extends ValidateOptions {
  /** default 1 */
  minLength?: number;
  /** default 999 */
  maxLength?: number;
}

export interface ArrayValidateOpts extends ValidateOptions {
  /** default 1 */
  minLength?: number;
  /** default 1000 */
  maxLength?: number;
  /** TODO: Limit array to only contain this type. Default: "any" */
  contains?: ExpectType | "any";
}

export interface ObjectValidateOpts extends ValidateOptions {
  /** default 1 */
  minProps?: number;
  /** default 1000 */
  maxProps?: number;
}

export interface PhoneNumberValidateOpts extends ValidateOptions {}

export interface SortValidateOpts extends ValidateOptions {}

export type ExpectType =
  | "number"
  | "string"
  | "object"
  | "array"
  | "boolean"
  | "sort"
  | "phoneNumber";

export type ValidatorOptions<T extends ExpectType> = T extends "number"
  ? NumberValidateOpts
  : T extends "string"
  ? StringValidateOpts
  : T extends "array"
  ? ArrayValidateOpts
  : T extends "object"
  ? ObjectValidateOpts
  : T extends "phoneNumber"
  ? PhoneNumberValidateOpts
  : ValidateOptions;

import numberValidator from "./number";
import stringValidator from "./string";
import arrayValidator from "./array";
import booleanValidator from "./boolean";
import objectValidator from "./object";
import sortValidator from "./sort";

type returnType<T> = T extends "number"
  ? number | false
  : T extends "string"
  ? string | false
  : T extends "array"
  ? any[] | false
  : T extends "boolean"
  ? boolean | false
  : T extends "object"
  ? object | false
  : T extends "sort"
  ? object | false
  : T extends "phoneNumber"
  ? string | false
  : false;

/**
 *
 * @param val variable to validate
 * @param fieldName name of variable for storing error
 * @param expect expected type of variable
 * @param errs errs object. If val is not undefined but is incorrect type, will store error message here.
 * @param options
 * @returns false if val is not of expected type or is undefined and required. val otherwise.
 */
export async function dataValidator<ET extends ExpectType>(
  val: any,
  fieldName: string,
  expect: ET,
  errs: ErrorsDesc,
  options?: ValidatorOptions<ET>
): Promise<returnType<ET>> {
  switch (expect) {
    case "number":
      return numberValidator(
        val,
        fieldName,
        errs,
        options || {}
      ) as returnType<ET>;
    case "string":
      return stringValidator(
        val,
        fieldName,
        errs,
        options || {}
      ) as returnType<ET>;
    case "array":
      return arrayValidator(
        val,
        fieldName,
        errs,
        options || {}
      ) as returnType<ET>;
    case "boolean":
      return booleanValidator(
        val,
        fieldName,
        errs,
        options || {}
      ) as returnType<ET>;
    case "object":
      return objectValidator(
        val,
        fieldName,
        errs,
        options || {}
      ) as returnType<ET>;
    case "sort":
      return sortValidator(
        val,
        fieldName,
        errs,
        options || {}
      ) as returnType<ET>;
    default:
      throw new Error(`invalid expected type in dataValidator: ${expect}`);
  }
}
