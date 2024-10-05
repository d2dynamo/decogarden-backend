/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-bitwise */
import * as crypto from "node:crypto";
import { base32Decode, base32Encode } from "./base32";

const { subtle } = crypto.webcrypto;

/* HMAC-based OTP */
const hotp = async (secret: any, counter: any) => {
  // Uint8Array(8)
  const padCounter = (counter: any) => {
    const pairs = counter.toString(16).padStart(16, "0").match(/..?/g);
    const array = pairs.map((v: any) => parseInt(v, 16));
    return Uint8Array.from(array);
  };

  // Uint8Array(20)
  const hmac = async (secret: string, counter: any) => {
    const keyData = base32Decode(secret);

    const key = await subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: { name: "SHA-1" } },
      false,
      ["sign"]
    );

    return new Uint8Array(await subtle.sign("HMAC", key, padCounter(counter)));
  };

  // Number
  function truncate(hs: any) {
    const offset = hs[19] & 0b1111;
    return (
      ((hs[offset] & 0x7f) << 24) |
      (hs[offset + 1] << 16) |
      (hs[offset + 2] << 8) |
      hs[offset + 3]
    );
  }

  // HOTP(K, C) = truncate(HMAC(K, C))
  const num = truncate(await hmac(secret, counter));

  // return 6 digits, padded with leading zeros
  return num.toString().padStart(6, "0").slice(-6);
};

export const totp = async (
  secret: any,
  windowBack: number,
  windowForward: number
) => {
  const codes = [await hotp(secret, Math.floor(+new Date() / 30000))];
  for (let i = 1; i <= windowBack; i++) {
    codes.push(await hotp(secret, Math.floor(+new Date() / 30000) - i));
  }

  for (let i = 1; i <= windowForward; i++) {
    codes.push(await hotp(secret, Math.floor(+new Date() / 30000) + i));
  }

  return codes;
};

export const generateBase32Secret = () => {
  const randomBytes = crypto.randomBytes(10);

  const arrayBuffer = randomBytes.buffer.slice(
    randomBytes.byteOffset,
    randomBytes.byteOffset + randomBytes.byteLength
  ) as ArrayBuffer;

  const secret = base32Encode(arrayBuffer);
  return secret;
};
