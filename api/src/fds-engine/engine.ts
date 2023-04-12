import { FDS_LOGGER, printScore, getCurrentScores } from "./utils";
import { IPFArgs, CArgs } from "./types";
import { Request, Response } from "express";
import { User } from "../entities/User";
import Redis from "ioredis";
import { _generateAuthenticationOptions } from "../api/auth/auth";

/**
 * @summary Validates IP Address and Fingerprint
 * @param user
 * @param ipfargs
 * @param redis
 * @param req
 * @param res
 * @returns Stores user session if IPF is valid
 */
export const validateIPF = async (
  user: User,
  redis: Redis.Redis,
  req: Request,
  res: Response,
  ipfargs: IPFArgs
) => {
  if (
    ipfargs.ip !== user.fingerprint.ip &&
    ipfargs.fingerprint !== user.fingerprint.fingerprint
  ) {
    await redis.incrby(`DS:${user.user_id}`, 10);
  } else if (
    ipfargs.ip !== user.fingerprint.ip ||
    ipfargs.fingerprint !== user.fingerprint.fingerprint
  ) {
    await redis.incrby(`DS:${user.user_id}`, 5);
  }

  // DEMO ONLY
  redis.incrby(`DS:${user.user_id}`, 10);
  printScore(user.user_id, redis);

  // check if OTP is required
  let cs = await getCurrentScores(user.user_id, redis);
  if (cs.scores[0] === 10) {
    FDS_LOGGER("OTP REQUIRED");
    return res.json({
      ok: false,
      data: {
        email: user.email,
      },
      errors: [
        {
          field: "auth",
          message: "requireOTP",
        },
      ],
    });
  }

  // store user session
  req.session.userID = user.user_id;

  return res.json({
    ok: true,
    data: null,
    errors: [],
  });
};

/**
 * @summary Validates card information
 * @param user
 * @param res
 * @param redis
 * @param args
 * @returns Approves order if everything checks out
 */
export const validateCard = async (
  user: User,
  res: Response,
  redis: Redis.Redis,
  args: CArgs
) => {
  const { card_cvc, card_expiry, card_name, card_number } = args;

  if (
    card_number !== user?.card.card_number ||
    parseInt(card_cvc) !== user?.card.card_cvc ||
    parseInt(card_expiry) !== user?.card.card_expiry ||
    card_name !== user?.card.card_name
  ) {
    await redis.decrby(`TC:${user?.user_id}`, 1);
    await redis.incrby(`DS:${user?.user_id}`, 5);

    printScore(user.user_id, redis);

    let cs = await getCurrentScores(user.user_id, redis);

    if (cs.scores[1] === 0 || cs.scores[0] > 20) {
      return blockAccount(user.user_id, res);
    }

    return res.json({
      ok: false,
      data: null,
      errors: [
        {
          field: "card",
          message: `Card information is wrong. You have ${cs.scores[1]} ${
            cs.scores[1] === 1 ? "try" : "tries"
          } left.`,
        },
      ],
    });
  }

  let cs = await getCurrentScores(user.user_id, redis);
  if (cs.scores[0] === 20) {
    FDS_LOGGER("TFA REQUIRED");
    const options = await _generateAuthenticationOptions();
    if (options) {
      return res.json({
        ok: false,
        data: { options },
        errors: [{ field: "auth", message: "requireTFA" }],
      });
    }
  }
  return res.json({
    ok: true,
    data: null,
    errors: [],
  });
};

/**
 * @summary Blocks user account
 * @param user_id
 * @param res
 * @
 */
const blockAccount = (user_id: string, res: Response) => {
  FDS_LOGGER(`ACCOUNT BLOCKED [${user_id}]`);
  res.json({
    ok: false,
    data: null,
    errors: [
      {
        field: "card",
        message: "Your account has been blocked!",
      },
    ],
  });
};
