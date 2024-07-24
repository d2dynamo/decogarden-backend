import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import "dotenv/config";
import { createServer as https } from "https";
import { createServer as http } from "http";
import { readFileSync } from "fs";

import { send } from "./modules/send";
import { getGracey } from "./modules/gracey";
import rateLimit from "express-rate-limit";
import bodyParser from "body-parser";

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
    } catch (err) {
      console.error(err);
    }
  })();
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
  keyGenerator: (req: Request) => {
    const ip = req.headers["x-forwarded-for"] || req.ip?.toString() || "";

    return String(ip);
  },
});

const app: Application = express();

app.set("etag", true);
app.set("x-powered-by", false);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Max-Age", "86400");
    return res.sendStatus(204);
  }

  res.setHeader("Content-Type", "application/json");

  next();
});
app.use(rateLimitExpress);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  if (ServerShuttingDown) {
    res.status(503).send("Server is shutting down");
    return;
  }
  next();
});

app.use((req, res, next) => {
  console.log("req received", req);
});

const portHttp = Number(process.env.HTTP_PORT) || 3000;
const portHttps = Number(process.env.HTTPS_PORT) || 4443;

if (!process.env.HTTPS_CERT_FILE || !process.env.HTTPS_KEY_FILE) {
  console.log("Missing https certs");
  process.exit(0);
}

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
