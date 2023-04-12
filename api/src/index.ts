import "dotenv/config";
import "reflect-metadata";
import fs from "fs";
import path from "path";
import https from "https";
import express, { json, urlencoded } from "express";
import cors from "cors";
import Redis from "ioredis";
import connectRedis from "connect-redis";
import session from "express-session";
import { createConnection } from "typeorm";
import auth from "./api/auth/auth";
import user from "./api/user/user";
import product from "./api/product/product";
import cart from "./api/cart/cart";
import checkout from "./api/checkout/checkout";
import { User } from "./entities/User";
import { Product } from "./entities/Product";
import { Cart } from "./entities/Cart";
import { Card } from "./entities/Card";
import { Fingerprint } from "./entities/Fingerprint";

const main = async () => {
  const {
    PORT,
    WEB_APP_URL,
    COOKIE_NAME,
    COOKIE_SECRET,
    NODE_ENV,
    DATABASE_URL,
  } = process.env;
  const __prod__ = NODE_ENV === "production";

  await createConnection({
    type: "postgres",
    url: DATABASE_URL,
    logging: false,
    synchronize: true,
    entities: [User, Product, Cart, Card, Fingerprint],
  });

  const redis: Redis.Redis = new Redis();
  const redisStore = connectRedis(session);

  const app = express();
  app.use(cors({ origin: WEB_APP_URL, credentials: true }));
  app.use(
    session({
      name: COOKIE_NAME,
      store: new redisStore({
        client: redis,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true,
        sameSite: "lax",
        secure: __prod__,
        domain: __prod__ ? "" : undefined,
      },
      saveUninitialized: false,
      secret: COOKIE_SECRET as string,
      resave: false,
    })
  );
  app.use(json());
  app.use(urlencoded({ extended: true }));

  // express router
  app.use("/api/auth", auth);
  app.use("/api/user", user);
  app.use("/api/product", product);
  app.use("/api/cart", cart);
  app.use("/api/checkout", checkout);

  app.get("/", (_, res) => {
    res.sendStatus(200);
  });

  if (__prod__) {
    app.listen(PORT, () => {
      console.log(`server is running on PORT: ${PORT} [HTTP]`);
    });
  } else {
    // create HTTPS server
    const key = fs.readFileSync(path.join(__dirname, "../cert/key.pem"));
    const cert = fs.readFileSync(path.join(__dirname, "../cert/cert.pem"));
    const httpsServer = https.createServer(
      { key, cert, rejectUnauthorized: false },
      app
    );
    httpsServer.listen(PORT, () => {
      console.log(`server is running on PORT: ${PORT} [HTTPS]`);
    });
  }
};

main().catch((error) => {
  console.error(error);
});
