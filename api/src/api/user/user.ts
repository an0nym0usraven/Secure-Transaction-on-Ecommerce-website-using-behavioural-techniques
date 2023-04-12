import { Router } from "express";
import { User } from "../../entities/User";
import { isAuth } from "../../middleware/isAuth";
import { getRepository } from "typeorm";

const router = Router();

// POST /api/user/whoami
// return current user
router.get("/whoami", isAuth, async (req, res) => {
  try {
    const user_id = req.session.userID;
    const userRepo = getRepository(User);
    const user = await userRepo.findOne({
      user_id,
    });

    if (user) {
      return res.json({
        ok: true,
        data: {
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
        },
        errors: [],
      });
    } else {
      throw new Error("Account not found");
    }
  } catch (error) {
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
