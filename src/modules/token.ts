import * as jose from "jose";
import { readFile } from "fs/promises";
import type { ObjectId } from "mongodb";

const JWT_ALG = "RS256";
const JWT_AUD = "dekosodasbackend";
const JWT_ISS = "dekosodas";

async function getPrivateKey(): Promise<string> {
  const path = process.env.JWT_PRIVATE_KEY_PATH;

  if (!path) {
    throw new Error("JWT_PRIVATE_KEY_PATH is not set");
  }

  const keyBuffer = await readFile(path);
  const key = keyBuffer.toString("utf-8");

  if (!key) {
    throw new Error("Private Key is empty");
  }

  return key;
}

async function getPublicKey(): Promise<string> {
  const path = process.env.JWT_PUBLIC_KEY_PATH;

  if (!path) {
    throw new Error("JWT_PUBLIC_KEY_PATH is not set");
  }

  const keyBuffer = await readFile(path);
  const key = keyBuffer.toString("utf-8");

  if (!key) {
    throw new Error("Public Key is empty");
  }

  return key;
}

export type ExpirationString = `${number}${
  | "s"
  | "m"
  | "h"
  | "d"
  | "w"
  | "M"
  | "y"}`;
export type TokenType = "access_token" | "refresh_token";

interface TokenOpts {
  userId: ObjectId | string;
  email: string;
  expiration: ExpirationString;
  type: TokenType;
}

export async function generateToken<T extends TokenOpts>(
  opts: T
): Promise<string> {
  const pemkey = await getPrivateKey();

  const privateKey = await jose.importPKCS8(pemkey, JWT_ALG);

  const jwt = await new jose.SignJWT({
    type: opts.type,
    sub: String(opts.userId),
    sub_email: opts.email,
  })
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuedAt()
    .setExpirationTime(opts.expiration)
    .setIssuer(JWT_ISS)
    .setAudience(JWT_AUD)
    .sign(privateKey);

  return jwt;
}

export type JWTValidationResult =
  | { verified: true; jwt: jose.JWTVerifyResult }
  | {
      verified: false;
      isExpired: boolean;
      isInvalid: boolean;
      signatureVerificationFailed: boolean;
      claimedValidationFailed: boolean;
      jwt: null;
    };

export async function validateToken(
  jwt: string,
  type: TokenType
): Promise<JWTValidationResult> {
  try {
    const pemkey = await getPublicKey();

    const pubKey = await jose.importSPKI(pemkey, JWT_ALG);

    const jwtVerify = await jose.jwtVerify(jwt, pubKey, {
      algorithms: [JWT_ALG],
      audience: JWT_AUD,
      issuer: JWT_ISS,
    });

    if (jwtVerify && jwtVerify.payload && jwtVerify.payload.type !== type) {
      throw new Error(`Invalid ${type}`);
    }

    return {
      verified: true,
      jwt: jwtVerify,
    };
  } catch (err) {
    if (err instanceof jose.errors.JOSEError) {
      throw err;
    } else {
      return {
        verified: false,
        isExpired: err instanceof jose.errors.JWTExpired,
        isInvalid: err instanceof jose.errors.JWTInvalid,
        signatureVerificationFailed:
          err instanceof jose.errors.JWSSignatureVerificationFailed,
        claimedValidationFailed:
          err instanceof jose.errors.JWTClaimValidationFailed,
        jwt: null,
      };
    }
  }
}
