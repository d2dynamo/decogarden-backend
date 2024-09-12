export default async function verifyEmail(token: string): Promise<boolean> {
  // get email from redis
  // update user emailVerify to true
  // delete token from redis
  return true;
}
