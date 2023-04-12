import type {
  GenerateRegistrationOptionsOpts,
  VerifiedAuthenticationResponse,
  VerifiedRegistrationResponse,
  VerifyAuthenticationResponseOpts,
  VerifyRegistrationResponseOpts,
} from "@simplewebauthn/server";
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import type {
  AuthenticationCredentialJSON,
  RegistrationCredentialJSON,
} from "@simplewebauthn/typescript-types";
import argon2 from "argon2";
import { Router } from "express";
import Redis from "ioredis";
import { getRepository } from "typeorm";
import { Card } from "../../entities/Card";
import { Fingerprint } from "../../entities/Fingerprint";
import { User } from "../../entities/User";
import { validateIPF } from "../../fds-engine/engine";
import { IPFArgs } from "../../fds-engine/types";
import { FDS_LOGGER } from "../../fds-engine/utils";
import {
  validateLogin,
  validateRegister,
} from "../../utils/validation/validateAuth";

const router = Router();
/**
 * CREDENTIAL BUFFER
 * ONLY FOR DEVELOPMENT
 */
let XBUFFER: any;

// POST /api/auth/register
// register new user
router.post("/register", async (req, res) => {
  const { args } = req.body;

  const errors = validateRegister(args);
  if (errors.length !== 0) {
    return res.status(400).json({
      ok: false,
      data: null,
      errors,
    });
  }

  try {
    const { email, password, first_name, last_name, fingerprint, TFA_auth } =
      args;

    // hash the password
    const hashedPassword = await argon2.hash(password);

    // store fingerprint
    const fingerprintRepo = getRepository(Fingerprint);
    const result0 = fingerprintRepo.create({
      fingerprint,
      ip: req.ip,
    });
    const savedFingerprint = await fingerprintRepo.save(result0);

    /**
     * store card information
     * ONLY FOR DEVELOPMENT
     */
    const cardRepo = getRepository(Card);
    const result1 = cardRepo.create({
      card_number: "1111222233334444",
      card_cvc: 123,
      card_expiry: 1225,
      card_name: "John Doe",
    });
    const savedCard = await cardRepo.save(result1);

    const userRepo = getRepository(User);
    let user;
    let result = userRepo.create({
      email,
      password: hashedPassword,
      first_name: first_name.toLowerCase(),
      last_name: last_name.toLowerCase(),
      card: savedCard,
      fingerprint: savedFingerprint,
    });

    user = await userRepo.save(result);

    FDS_LOGGER(
      `New user: ${result.email} | ${result.fingerprint.fingerprint} | ${result.fingerprint.ip}`
    );
    // store user session
    req.session.userID = user.user_id;

    // check if user has opted for two factor authentication
    if (TFA_auth) {
      let options = _generateRegistrationOptions();
      return res.json({
        ok: true,
        data: {
          options,
        },
        errors: [],
      });
    }
    return res.json({
      ok: true,
      data: null,
      errors: [],
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(500).json({
        ok: false,
        data: null,
        errors: [
          {
            field: "email",
            message: "Account already exists",
          },
        ],
      });
    } else {
      console.error(error);
      return res.status(500).json({
        ok: false,
        data: null,
        errors: [
          {
            field: "server",
            message: "Something went wrong on the server",
          },
        ],
      });
    }
  }
});

// POST /api/auth/login
// log the user in
router.post("/login", async (req, res) => {
  const { args } = req.body;

  const errors = validateLogin(args);
  if (errors.length !== 0) {
    return res.status(400).json({
      ok: false,
      data: null,
      errors,
    });
  }

  try {
    const { email, password, fingerprint: userFingerprint } = args;

    const userRepo = getRepository(User);
    const user = await userRepo.findOne(
      {
        email,
      },
      {
        relations: ["fingerprint"],
      }
    );

    if (!user) {
      return res.status(400).json({
        ok: false,
        data: null,
        errors: [
          {
            field: email,
            message: "The email you entered isn’t connected to an account",
          },
        ],
      });
    }

    // verify password
    const verifyPassword = await argon2.verify(user.password, password);
    if (!verifyPassword) {
      return res.status(400).json({
        ok: false,
        data: null,
        errors: [
          {
            field: "password",
            message: "The password you entered is incorrect.",
          },
        ],
      });
    }

    // set initial DEVIATION_SCORE & TRY_COUNTER vars
    const redis: Redis.Redis = new Redis();
    await redis.set(`DS:${user?.user_id}`, 0);
    await redis.set(`TC:${user?.user_id}`, 3);

    FDS_LOGGER(`IP: ${req.ip} | FINGERPRINT HASH: ${userFingerprint}`);

    // validate IP & Fingerprint
    const ipfargs: IPFArgs = {
      ip: req.ip,
      fingerprint: userFingerprint,
    };
    return validateIPF(user, redis, req, res, ipfargs);
  } catch (error) {
    return res.status(500).json({
      ok: false,
      data: null,
      errors: [
        {
          field: "server",
          message: "Something went wrong on the server",
        },
      ],
    });
  }
});

// GET /api/auth/logout
// delete user session
router.get("/logout", (req, res) => {
  req.session.destroy((err: any) => {
    res.clearCookie(process.env.COOKIE_NAME as string);
    if (err) {
      return res.status(500).json({
        ok: false,
        data: null,
        errors: [
          {
            field: "server",
            message: "Something went wrong on the server",
          },
        ],
      });
    } else {
      return res.sendStatus(200);
    }
  });
});

// POST /api/auth/otp
// verify OTP
router.post("/otp", async (req, res) => {
  const { otp, email } = req.body.args;

  try {
    const userRepo = getRepository(User);
    const user = await userRepo.findOne({
      email,
    });

    if (!user) {
      return res.status(400).json({
        ok: false,
        data: null,
        errors: [
          {
            field: email,
            message: "The email you entered isn’t connected to an account",
          },
        ],
      });
    }

    // ONLY FOR DEVELOPMENT
    // Generate unique OTP
    if (otp !== "1234") {
      FDS_LOGGER("OTP VERIFICATION FAILED");
      return res.json({
        ok: false,
        data: null,
        errors: [
          {
            field: "auth",
            message: "OTP entered was wrong!",
          },
        ],
      });
    }

    // store user session
    FDS_LOGGER("OTP VERIFIED");
    req.session.userID = user.user_id;

    return res.json({
      ok: true,
      data: null,
      errors: [],
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      data: null,
      errors: [
        {
          field: "server",
          message: "Something went wrong on the server",
        },
      ],
    });
  }
});

/**
 * TWO FACTOR AUTHENTICATION
 */

// generate options for webauthn [registration]
const _generateRegistrationOptions = () => {
  const redis: Redis.Redis = new Redis();
  const opts: GenerateRegistrationOptionsOpts = {
    rpName: "FDS Demo",
    rpID: "localhost",
    userName: "test",
    userID: "test",
    timeout: 60000,
    attestationType: "none",
    authenticatorSelection: {
      authenticatorAttachment: "cross-platform",
      userVerification: "discouraged",
      requireResidentKey: false,
    },
    supportedAlgorithmIDs: [-7, -257],
  };

  const options = generateRegistrationOptions(opts);

  redis.set("challenge", options.challenge);

  return options;
};

// POST /api/auth/verify-registration
// verify TFA registration
router.post("/verify-registration", async (req, res) => {
  const redis: Redis.Redis = new Redis();
  const body: RegistrationCredentialJSON = req.body.args.options;
  const expectedChallenge = await redis.get("challenge");
  let verification: VerifiedRegistrationResponse;

  try {
    const opts: VerifyRegistrationResponseOpts = {
      credential: body,
      expectedChallenge: `${expectedChallenge}`,
      expectedOrigin: process.env.WEB_APP_URL as string,
      expectedRPID: "localhost",
    };
    verification = await verifyRegistrationResponse(opts);
  } catch (error) {
    console.error(error);
    return res.json({
      ok: false,
      data: null,
      errors: [
        {
          field: "auth",
          message: "TFA verification failed",
        },
      ],
    });
  }

  const { verified, registrationInfo } = verification;

  if (verified && registrationInfo) {
    XBUFFER = registrationInfo;
    return res.json({
      verified,
    });
  } else {
    return res.json({
      ok: false,
      data: null,
      errors: [
        {
          field: "auth",
          message: "TFA verification failed",
        },
      ],
    });
  }
});

// generate options for webauthn [authentication]
export const _generateAuthenticationOptions = async () => {
  const redis: Redis.Redis = new Redis();
  const options = generateAuthenticationOptions({
    rpID: "localhost",
    timeout: 120000,
    userVerification: "discouraged",
    allowCredentials: [
      {
        id: XBUFFER.credentialID,
        type: "public-key",
      },
    ],
  });

  redis.set("challenge2", options.challenge);

  return options;
};

// POST /api/auth/verify-authentication
// verify TFA authentication
router.post("/verify-authentication", async (req, res) => {
  const redis: Redis.Redis = new Redis();
  const body: AuthenticationCredentialJSON = req.body.args.options;
  const expectedChallenge = (await redis.get("challenge2")) as string;
  let verification: VerifiedAuthenticationResponse;

  try {
    const opts: VerifyAuthenticationResponseOpts = {
      credential: body,
      expectedChallenge,
      expectedOrigin: process.env.WEB_APP_URL as string,
      expectedRPID: "localhost",
      authenticator: XBUFFER,
    };
    verification = verifyAuthenticationResponse(opts);
  } catch (error) {
    console.error(error);
    return res.json({
      ok: false,
      data: null,
      errors: [
        {
          field: "auth",
          message: "TFA verification failed",
        },
      ],
    });
  }

  const { verified } = verification;

  if (verified) {
    FDS_LOGGER("USER VERIFIED");
    return res.json({ verified });
  } else {
    FDS_LOGGER("USER VERIFICATION FAILED");
    return res.json({
      ok: false,
      data: null,
      errors: [
        {
          field: "auth",
          message: "TFA verification failed",
        },
      ],
    });
  }
});

export default router;
