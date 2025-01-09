import { expect, test } from 'bun:test';

import DataValidator from '../src/modules/validator';
import { ControllerState } from '../src/controllers/types';

/*
  DataValidator notes: 
  undefined and null should false but not error if not required.
  undefined and null should false and give error if required.
  incorrect type should give false and error even if not required.
*/

const emptyState: ControllerState = {
  dataErrors: {},
  failMsg: false,
};

const makeEmpty = (state: ControllerState) => {
  state.dataErrors = {};
  state.failMsg = false;
};

const errorState: ControllerState = {
  dataErrors: { test: expect.any(String) },
  failMsg: false,
};

const missingRequiredState: ControllerState = {
  dataErrors: { test: expect.any(String) },
  failMsg: expect.any(String),
};

// UNDEFINED AND NULL CHECK
test('dataValidatorUndefinedNull', async () => {
  const state: ControllerState = {
    dataErrors: {},
    failMsg: false,
  };
  const dv = new DataValidator(state);

  expect(await dv.check(undefined, 'test', 'number')).toBe(false);
  expect(state).toEqual(errorState);
  makeEmpty(state);

  expect(await dv.check(null, 'test', 'array', { required: true })).toBe(false);
  expect(state).toEqual(missingRequiredState);
});

// STRING VALIDATOR
test('dataValidatorString', async () => {
  const state: ControllerState = {
    dataErrors: {},
    failMsg: false,
  };
  const dv = new DataValidator(state);

  expect(await dv.check('test', 'test', 'string')).toBe('test');
  expect(state).toEqual(emptyState);

  expect(await dv.check('test', 'test', 'string', { minLength: 8 })).toBe(
    false
  );
  expect(state).toEqual(errorState);
  makeEmpty(state);

  expect(await dv.check('test', 'test', 'string', { maxLength: 2 })).toBe(
    false
  );
  expect(state).toEqual(errorState);
  makeEmpty(state);

  expect(await dv.check(123, 'test', 'string')).toBe(false);
  expect(state).toEqual(errorState);
});

// NUMBER VALIDATOR
test('dataValidatorNumber', async () => {
  const state: ControllerState = {
    dataErrors: {},
    failMsg: false,
  };
  const dv = new DataValidator(state);

  expect(await dv.check(123, 'test', 'number')).toBe(123);
  expect(state).toEqual(emptyState);

  // dataValidator can convert stringified numbers to numbers
  expect(await dv.check('123', 'test', 'number')).toBe(123);
  expect(state).toEqual(emptyState);

  expect(await dv.check(-1, 'test', 'number')).toBe(false);
  expect(state).toEqual(errorState);
  makeEmpty(state);

  expect(await dv.check(123, 'test', 'number', { min: 200 })).toBe(false);
  expect(state).toEqual(errorState);
  makeEmpty(state);

  expect(await dv.check(123, 'test', 'number', { max: 100 })).toBe(false);
  expect(state).toEqual(errorState);
  makeEmpty(state);

  expect(await dv.check('test', 'test', 'number')).toBe(false);
  expect(state).toEqual(errorState);
  makeEmpty(state);

  expect(await dv.check({}, 'test', 'number')).toBe(false);
  expect(state).toEqual(errorState);

  expect(await dv.check([1, 2, 3], 'test', 'number')).toBe(false);
  expect(state).toEqual(errorState);
});

// ARRAY VALIDATOR
test('dataValidatorArray', async () => {
  const state: ControllerState = {
    dataErrors: {},
    failMsg: false,
  };
  const dv = new DataValidator(state);

  expect(await dv.check([1, 2, 3], 'test', 'array')).toEqual([1, 2, 3]);
  expect(state).toEqual(emptyState);

  expect(await dv.check('123', 'test', 'array')).toBe(false);
  expect(state).toEqual(errorState);
  makeEmpty(state);

  expect(await dv.check([1, 2, 3], 'test', 'array', { minLength: 4 })).toBe(
    false
  );
  expect(state).toEqual(errorState);
  makeEmpty(state);

  expect(await dv.check([1, 2, 3], 'test', 'array', { maxLength: 2 })).toBe(
    false
  );
  expect(state).toEqual(errorState);
  makeEmpty(state);

  expect(await dv.check({}, 'test', 'array')).toBe(false);
  expect(state).toEqual(errorState);
  makeEmpty(state);

  expect(await dv.check(123, 'test', 'array')).toBe(false);
  expect(state).toEqual(errorState);
});

// BOOLEAN VALIDATOR
test('dataValidatorBoolean', async () => {
  const state: ControllerState = {
    dataErrors: {},
    failMsg: false,
  };
  const dv = new DataValidator(state);

  expect(await dv.check(true, 'test', 'boolean')).toBe(true);
  expect(state).toEqual(emptyState);

  expect(await dv.check(false, 'test', 'boolean')).toBe(false);
  expect(state).toEqual(emptyState);

  // stringified boolean should be converted to boolean
  expect(await dv.check('true', 'test', 'boolean')).toBe(true);
  expect(state).toEqual(emptyState);

  expect(await dv.check('false', 'test', 'boolean')).toBe(false);
  expect(state).toEqual(emptyState);

  // 1's and 0's should be converted to boolean
  expect(await dv.check(1, 'test', 'boolean')).toBe(true);
  expect(state).toEqual(emptyState);

  expect(await dv.check(0, 'test', 'boolean')).toBe(false);
  expect(state).toEqual(emptyState);

  expect(await dv.check('test', 'test', 'boolean')).toBe(false);
  expect(state).toEqual(errorState);
  makeEmpty(state);

  expect(await dv.check({}, 'test', 'boolean')).toBe(false);
  expect(state).toEqual(errorState);
  makeEmpty(state);

  expect(await dv.check([1, 2, 3], 'test', 'boolean')).toBe(false);
  expect(state).toEqual(errorState);
  makeEmpty(state);

  expect(await dv.check(123, 'test', 'boolean')).toBe(false);
  expect(state).toEqual(errorState);
  makeEmpty(state);
});

// OBJECT VALIDATOR
test('dataValidatorObject', async () => {
  const state: ControllerState = {
    dataErrors: {},
    failMsg: false,
  };
  const dv = new DataValidator(state);

  expect(await dv.check({ thing: 'ok' }, 'test', 'object')).toEqual({
    thing: 'ok',
  });
  expect(state).toEqual(emptyState);

  expect(await dv.check({}, 'test', 'object', { minProps: 1 })).toBe(false);
  expect(state).toEqual(errorState);
  makeEmpty(state);

  expect(
    await dv.check({ thing1: 'ok', thing2: 'ok' }, 'test', 'object', {
      maxProps: 1,
    })
  ).toBe(false);
  expect(state).toEqual(errorState);
  makeEmpty(state);

  expect(await dv.check('test', 'test', 'object')).toBe(false);
  expect(state).toEqual(errorState);
  makeEmpty(state);

  expect(await dv.check(123, 'test', 'object')).toBe(false);
  expect(state).toEqual(errorState);
  makeEmpty(state);

  expect(await dv.check([1, 2, 3], 'test', 'object')).toBe(false);
  expect(state).toEqual(errorState);
  makeEmpty(state);
});

// SORT VALIDATOR
test('dataValidatorSort', async () => {
  const state: ControllerState = {
    dataErrors: {},
    failMsg: '',
  };
  const dv = new DataValidator(state);

  expect(await dv.check({ thing: 1, thing2: -1 }, 'test', 'sort')).toEqual({
    thing: 1,
    thing2: -1,
  });
  expect(state).toEqual(emptyState);

  expect(await dv.check({}, 'test', 'sort', { required: true })).toBe(false);
  expect(state).toEqual(missingRequiredState);
  makeEmpty(state);

  expect(await dv.check({ thing1: 'ok', thing2: 0 }, 'test', 'sort')).toBe(
    false
  );
  expect(state).toEqual({ dataErrors: expect.any(Object), failMsg: false });
  makeEmpty(state);

  expect(await dv.check('test', 'test', 'sort')).toBe(false);
  expect(state).toEqual(errorState);
  makeEmpty(state);

  expect(await dv.check(123, 'test', 'sort')).toBe(false);
  expect(state).toEqual(errorState);
});

// PHONE NUMBER VALIDATOR
test('dataValidatorPhoneNumber', async () => {
  const state: ControllerState = {
    dataErrors: {},
    failMsg: '',
  };
  const dv = new DataValidator(state);

  expect(await dv.check('0744332211', 'test', 'phoneNumber')).toBe(
    '0744332211'
  );
  expect(state).toEqual(emptyState);

  expect(await dv.check('+46744332211', 'test', 'phoneNumber')).toBe(
    '+46744332211'
  );
  expect(state).toEqual(emptyState);

  expect(await dv.check('+46 (744)-332 211', 'test', 'phoneNumber')).toBe(
    '+46744332211'
  );
  expect(state).toEqual(emptyState);

  expect(
    await dv.check('07 744 332 211', 'test', 'phoneNumber', {
      international: true,
    })
  ).toBe(false);
  expect(state).toEqual(errorState);
  makeEmpty(state);

  expect(await dv.check('112', 'test', 'phoneNumber')).toBe(false);
  expect(state).toEqual(errorState);
  makeEmpty(state);

  expect(await dv.check(123456789, 'test', 'phoneNumber')).toBe(false);
  expect(state).toEqual(errorState);
  makeEmpty(state);

  expect(await dv.check({}, 'test', 'phoneNumber')).toBe(false);
  expect(state).toEqual(errorState);
  makeEmpty(state);

  expect(await dv.check([1, 2, 3], 'test', 'phoneNumber')).toBe(false);
  expect(state).toEqual(errorState);
  makeEmpty(state);
});

// EMAIL VALIDATOR
test('dataValidatorEmail', async () => {
  const state: ControllerState = {
    dataErrors: {},
    failMsg: '',
  };
  const dv = new DataValidator(state);

  expect(await dv.check('tester@gmail.com', 'test', 'email')).toBe(
    'tester@gmail.com'
  );
  expect(state).toEqual(emptyState);

  expect(await dv.check('tester@gmail.sub.com', 'test', 'email')).toBe(
    'tester@gmail.sub.com'
  );
  expect(state).toEqual(emptyState);

  expect(await dv.check('te.st.er@gmail.sub.com', 'test', 'email')).toBe(
    'te.st.er@gmail.sub.com'
  );
  expect(state).toEqual(emptyState);

  expect(await dv.check('tester@gmail', 'test', 'email')).toBe(false);
  expect(state).toEqual(errorState);
  makeEmpty(state);

  expect(await dv.check('tester', 'test', 'email')).toBe(false);
  expect(state).toEqual(errorState);
  makeEmpty(state);

  expect(await dv.check('tester@gmail.', 'test', 'email')).toBe(false);
  expect(state).toEqual(errorState);
  makeEmpty(state);

  expect(await dv.check('@gmail.com', 'test', 'email')).toBe(false);
  expect(state).toEqual(errorState);
  makeEmpty(state);

  expect(await dv.check(123456789, 'test', 'email')).toBe(false);
  expect(state).toEqual(errorState);
});
