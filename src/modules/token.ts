import * as jose from "jose";
import { readFile } from "fs/promises";
import type { ObjectId } from "mongodb";

const JWT_ALG = "RS256";
const JWT_AUD = "dekosodasbackend";
const JWT_ISS = "dekosodas";

let cachedPrivateKey: string | null = null;
let cachedPublicKey: string | null = null;

async function getPrivateKey(): Promise<string> {
  if (cachedPrivateKey) return cachedPrivateKey;

  const path = process.env.JWT_PRIVATE_KEY_PATH;
  if (!path) throw new Error("JWT_PRIVATE_KEY_PATH is not set");

  const keyBuffer = await readFile(path);
  const key = keyBuffer.toString("utf-8");
  if (!key) throw new Error("Private Key is empty");

  cachedPrivateKey = key;
  return key;
}

async function getPublicKey(): Promise<string> {
  if (cachedPublicKey) return cachedPublicKey;

  const path = process.env.JWT_PUBLIC_KEY_PATH;
  if (!path) throw new Error("JWT_PUBLIC_KEY_PATH is not set");

  const keyBuffer = await readFile(path);
  const key = keyBuffer.toString("utf-8");
  if (!key) throw new Error("Public Key is empty");

  cachedPublicKey = key;
  return key;
}

export type TokenType = "access_token" | "refresh_token";

export type ExpirationString = `${number}${
  | "s"
  | "m"
  | "h"
  | "d"
  | "w"
  | "M"
  | "y"}`;

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
    } else {
      console.log("unexpected validateToken error: ", err);
      throw err;
    }
  }
}
