import type { Request, Response } from "express";
import connectCollection from "../../modules/database/mongo";
import { generateToken } from "../../modules/token";
import type { ITokenUser } from "../../global/interfaces/token";

// export async function localLogin(req: Request, res: Response, next: Function) {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password) {
//       res.locals = {
//         error: true,
//         code: 400,
//         message: "Missing email or password",
//       };
//       next();
//       return;
//     }

//     const coll = await connectCollection("users");

//     const userDoc = await coll.findOneAndUpdate(
//       { email: email.toLocaleLowerCase() },
//       {
//         $set: { lastLoginAttempt: new Date() },
//       },
//       {
//         projection: {
//           _id: 1,
//           email: 1,
//           salt: 1,
//           hash: 1,
//         },
//       }
//     );

//     if (!userDoc) {
//       res.locals = {
//         error: true,
//         code: 400,
//         message: "Missing email or password",
//       };
//       next();
//       return;
//     }

//     if (!userDoc.hash) {
//       res.locals = {
//         error: true,
//         code: 400,
//         message: "Missing email or password",
//       };
//       next();
//       return;
//     }

//     if (!(await Bun.password.verify(password, userDoc.hash, "argon2id"))) {
//       res.locals = {
//         error: true,
//         code: 400,
//         message: "bad password",
//       };
//       next();
//       return;
//     }

//     await coll.updateOne({ email: email }, { $set: { lastLogin: new Date() } });

//     const access_token = generateToken({
//       userId: userDoc._id,
//       email: userDoc.email,
//       expiration: "4h",
//       type: "access_token",
//     });

//     const refresh_token = generateToken({
//       userId: userDoc._id,
//       email: userDoc.email,
//       expiration: "4h",
//       type: "refresh_token",
//     });

//     res.locals = {
//       error: true,
//       code: 200,
//       message: "success",
//       payload: {
//         access_token,
//         refresh_token,
//       },
//     };
//     next();
//   } catch (err) {
//     console.log(err);
//     res.locals = {
//       error: true,
//       code: 500,
//       message: "internal server error",
//     };
//     next();
//     return;
//   }
// }

export async function loginUserWithEmail(
  req: Request,
  res: Response,
  next: Function
) {
  try {
    const user = req.user as ITokenUser;

    console.log("user login controller after passport", user);

    const access_token = generateToken({
      userId: user.id,
      email: user.email,
      expiration: "4h",
      type: "access_token",
    });

    const refresh_token = generateToken({
      userId: user.id,
      email: user.email,
      expiration: "4h",
      type: "refresh_token",
    });

    res.locals = {
      error: true,
      code: 200,
      message: "success",
      payload: {
        access_token,
        refresh_token,
      },
    };
    next();
  } catch (err) {
    console.log(err);
    res.locals = {
      error: true,
      code: 500,
      message: "internal server error",
    };
    next();
  }
}
