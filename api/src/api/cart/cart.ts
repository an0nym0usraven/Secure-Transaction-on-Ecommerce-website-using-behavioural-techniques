import { Router } from "express";
import { validateCart } from "../../utils/validation/validateCart";
import { isAuth } from "../../middleware/isAuth";
import { getRepository } from "typeorm";
import { Cart } from "../../entities/Cart";

const router = Router();

// POST /api/cart
// add item to cart
router.post("/", isAuth, async (req, res) => {
  const { args } = req.body;

  const errors = await validateCart({
    creator: req.session.userID,
    ...args,
  });

  if (errors.length !== 0) {
    return res.status(200).json({
      ok: false,
      data: null,
      errors,
    });
  }

  try {
    const cartRepo = getRepository(Cart);
    const cartItem = cartRepo.create({
      ...args,
      creator: req.session.userID,
    });
    await cartRepo.save(cartItem);

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

// GET /api/cart
// get all items in cart
router.get("/", isAuth, async (req, res) => {
  try {
    const cartRepo = getRepository(Cart);
    const cart = await cartRepo
      .createQueryBuilder("cart")
      .select(["cart.cart_item_id", "cart.product_id", "cart.qty"])
      .where("cart.creator = :creator", { creator: req.session.userID })
      .getMany();

    if (cart.length === 0) {
      return res.json({
        ok: true,
        data: null,
        errors: [],
      });
    }

    return res.json({
      ok: true,
      data: { cart },
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

// check if item exists in the cart
export const isCartItem = async (
  creator: string,
  product_id: string
): Promise<boolean> => {
  try {
    const cartRepo = getRepository(Cart);
    const cartItem = await cartRepo.findOne({
      creator,
      product_id,
    });

    if (cartItem) return true;
    return false;
  } catch (error) {
    return true;
  }
};
export default router;
