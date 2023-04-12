import { Router } from "express";
import Redis from "ioredis";
import { getRepository } from "typeorm";
import { User } from "../../entities/User";
import { isAuth } from "../../middleware/isAuth";
import { validateCard } from "../../fds-engine/engine";

const router = Router();

// POST /api/checkout/verify
// perfom checkout
router.post("/verify", isAuth, async (req, res) => {
  try {
    const user_id = req.session.userID;
    const userRepo = getRepository(User);
    const user = await userRepo.findOne(user_id, {
      relations: ["card", "fingerprint"],
    });
    const redis: Redis.Redis = new Redis();
    const { args } = req.body;

    return validateCard(user as User, res, redis, args);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      ok: false,
      data: null,
      errors: [
        { field: "server", message: "Something went wrong on the server" },
      ],
    });
  }
});

export default router;
