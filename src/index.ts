import express, { type Application } from "express";
import "dotenv/config";
import { createServer as https } from "https";
import { createServer as http } from "http";
import { readFileSync } from "fs";
import rateLimit from "express-rate-limit";
import bodyParser from "body-parser";
import session from "express-session";
import cookieParser from "cookie-parser";

import { mongoClient } from "modules/database/mongo";
import cors from "./middlewares/cors";
import passport from "./modules/passport";
import { send } from "./modules/send";
import { getGracey } from "./modules/gracey";
import { generateToken } from "./modules/token";
import auth from "./routes/auth";

const gracey = getGracey();

let ServerShuttingDown = false;

async function interruptSignalHandler(signal: string) {
  logger.info(
    1,
    `Received ${signal}, shutting down gracefully, pid: ${process.pid}`,
    {},
    false
  );

  ServerShuttingDown = true;

  while (gracey.getTasksAmount() > 0) {
    await new Promise((r) => {
      setTimeout(r, 500);
    });
  }

  logger.info(1, `Graceful shutdown complete, pid: ${process.pid}`, {});
  process.exit(0);
}

// Development code
if (process.env.NODE_ENV === "development") {
  (async () => {
    try {
      const at = await generateToken({
        userId: "66a656a9c326bfbd55a4e143",
        email: "dev@decogarden.lt",
        expiration: "2h",
        type: "access_token",
      });

      console.log(`AccessToken: ${at}`);

      const dbn =
        process.env.NODE_ENV === "development"
          ? "dekosodas_dev"
          : process.env.MONGO_DB_NAME;

      console.log(`using dbname ${dbn}`);
      return;
    } catch (err) {
      console.error(err);
    }
  })();
}

if (!process.env.HTTPS_CERT_FILE || !process.env.HTTPS_KEY_FILE) {
  console.log("Missing https cert path");
  process.exit(0);
}

if (!process.env.SESSION_SECRET) {
  console.log("Missing session secret");
  process.exit(0);
}

process.on("SIGINT", () => {
  ServerShuttingDown = true;

  setTimeout(() => {
    console.log("Graceful shutdown timeout");
    process.exit(0);
  }, 30000);

  interruptSignalHandler("SIGINT");
});

process.on("SIGTERM", () => {
  ServerShuttingDown = true;

  setTimeout(() => {
    console.log("Graceful shutdown timeout");
    process.exit(0);
  }, 30000);

  interruptSignalHandler("SIGTERM");
});

const rateLimitExpress = rateLimit({
  windowMs: 1000 * 60 * 1,
  limit: 150,
});

const app: Application = express();

app.set("x-powered-by", false);

app.use(cors);
app.use(cookieParser());
app.use(rateLimitExpress);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },
  })
);

app.use((req, res, next) => {
  if (ServerShuttingDown) {
    res.status(503).send("Server is shutting down");
    return;
  }
  next();
});

app.use("/auth", [auth, send]);

app.use((req, res, next) => {
  passport.authenticate("bearer", (err, _, info) => {
    if (err) {
      res.locals = {
        error: true,
        code: err.code || 500,
        message: err.message,
        payload: {},
      };
      send(req, res);
      return;
    }
    if (info) {
      res.locals = {
        error: true,
        code: 401,
        message: "unauthorized",
        payload: {},
      };
      send(req, res);
      return;
    }
    next();
  })(req, res, next);
});

// ROUTES

import hello from "./routes/hello";
import item from "./routes/item";
import permission from "./routes/permission";
import userPermission from "./routes/userPermission";
import user from "./routes/user";
import logger from "./modules/logger";

app.use("/hello", [hello, send]);
app.use("/item", [item, send]);
app.use("/permission", [permission, send]);
app.use("/userPermission", [userPermission, send]);
app.use("/user", [user, send]);

// not found
app.use((req, res, next) => {
  res.status(404).json({
    message: "endpoint not found",
  });
});

// SERVER INIT

//Ensure db
try {
  let db = mongoClient();
  if (!db)
    throw new Error(
      "mongo client is null. Big uhoh, no info. failed to connect to mongo"
    );
} catch (err) {
  logger.error(1, "CRITICAL! couldnt connect to database, shutting down.", {
    error: err,
  });
  process.exit(1);
}

const portHttp = Number(process.env.HTTP_PORT) || 3000;
const portHttps = Number(process.env.HTTPS_PORT) || 4443;

const key = readFileSync(process.env.HTTPS_KEY_FILE);
const cert = readFileSync(process.env.HTTPS_CERT_FILE);

const httpsServer = https(
  {
    key,
    cert,
  },
  app
);
const httpServer = http({}, app);

let serverHttps = httpsServer.listen(portHttps, () => {});
let serverHttp = httpServer.listen(portHttp, () => {});
logger.info(1, `Server started on port ${portHttp} and ${portHttps}`, {});
