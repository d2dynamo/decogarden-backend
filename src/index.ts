import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import "dotenv/config";
import { createServer as https } from "https";
import { createServer as http } from "http";
import { readFileSync } from "fs";
import rateLimit from "express-rate-limit";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import session from "express-session";

import cors from "./middlewares/cors";
import passport from "./modules/passport";
import { send } from "./modules/send";
import { getGracey } from "./modules/gracey";
import { generateToken, validateToken } from "./modules/token";

//  ROUTERS
import auth from "./routes/auth";
import hello from "./routes/hello";
import type { UserError } from "./util/error";

const gracey = getGracey();

let ServerShuttingDown = false;

async function interruptSignalHandler(signal: string) {
  console.log(
    `Received ${signal}, shutting down gracefully, pid: ${process.pid}`
  );

  ServerShuttingDown = true;

  while (gracey.getTasksAmount() > 0) {
    await new Promise((r) => {
      setTimeout(r, 500);
    });
  }

  console.log("All tasks completed, shutting down, pid:", process.pid);
  process.exit(0);
}

// Development code
if (process.env.NODE_ENV === "development") {
  (async () => {
    try {
      const at = await generateToken({
        userId: "66a121cec326bfbd55a4c03f",
        email: "info@dekosodas.lt",
        expiration: "2h",
        type: "access_token",
      });

      console.log(`AccessToken: ${at}`);
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

app.use("/hello", [hello, send]);

// SERVER INIT

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
