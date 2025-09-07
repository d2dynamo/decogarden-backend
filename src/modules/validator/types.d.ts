import type { ObjectId } from "mongodb";

type ErrorsDesc = { [key: string]: string | object };

interface ValidateOptions {
  required?: boolean;
}

interface NumberValidateOpts extends ValidateOptions {
  min?: number = -999999999;
  max?: number = 999999999;
}

interface StringValidateOpts extends ValidateOptions {
  minLength?: number = 1;
  maxLength?: number = 999;
}

interface ArrayValidateOpts extends ValidateOptions {
  minLength?: number = 1;
  maxLength?: number = 1000;
  /** TODO: Limit array to only contain this type. Default: "any" */
  contains?: ExpectType | "any";
}

interface ObjectValidateOpts extends ValidateOptions {
  minProps?: number = 1;
  maxProps?: number = 1000;
}

interface PhoneNumberValidateOpts extends ValidateOptions {
  international?: boolean;
}

interface SortValidateOpts extends ObjectValidateOpts {}

interface EmailValidateOpts extends ValidateOptions {}

interface ObjectIdValidateOpts extends ValidateOptions {}

interface Sort extends Object {
  [key: string]: 1 | -1;
}

interface PhoneNumber extends String {}

interface Email extends String {}

type ValidatorTypes = {
  number: number;
  string: string;
  array: any[];
  boolean: boolean;
  object: Record<string, any>;
  phoneNumber: string;
  sort: Sort;
  email: string;
  objectId: ObjectId;
};

type ExpectType = keyof ValidatorTypes;

type ValidatorOptions<ET extends ExpectType> = ET extends "number"
  ? NumberValidateOpts
  : ET extends "string"
  ? StringValidateOpts
  : ET extends "array"
  ? ArrayValidateOpts
  : ET extends "object"
  ? ObjectValidateOpts
  : ET extends "phoneNumber"
  ? PhoneNumberValidateOpts
  : ET extends "email"
  ? EmailValidateOpts
  : ET extends "sort"
  ? SortValidateOpts
  : ET extends "objectId"
  ? ObjectIdValidateOpts
  : ValidateOptions;

type Validation = {
  value: any | false;
  error: string | false;
};

export {
  ErrorsDesc,
  ValidateOptions,
  NumberValidateOpts,
  StringValidateOpts,
  ArrayValidateOpts,
  ObjectValidateOpts,
  PhoneNumberValidateOpts,
  SortValidateOpts,
  EmailValidateOpts,
  ObjectIdValidateOpts,
  Sort,
  PhoneNumber,
  Email,
  ExpectType,
  ValidatorTypes,
  ValidatorOptions,
  Validation,
};
