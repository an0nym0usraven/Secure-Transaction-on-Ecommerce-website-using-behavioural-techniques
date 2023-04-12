import { Router } from "express";
import { getRepository } from "typeorm";
import { Product } from "../../entities/Product";

const router = Router();

// GET /api/product
// return product catalog
router.get("/", async (_, res) => {
  try {
    const productRepo = getRepository(Product);
    const products = await productRepo.find();
    if (products.length === 0) {
      return res.status(500).json({
        ok: false,
        data: null,
        errors: [
          {
            field: "product",
            message: "No products were found",
          },
        ],
      });
    } else {
      return res.json({
        ok: true,
        data: { products },
        errors: [],
      });
    }
  } catch (error) {
    return res.status(500).json({
      ok: false,
      data: null,
      errors: [
        {
          field: "server",
          message: error,
        },
      ],
    });
  }
});

// POST /api/product/id/:product_id
// return a specific product
router.get("/id/:product_id", async (req, res) => {
  if (!req.params.product_id) {
    return res.status(400).json({
      ok: false,
      data: null,
      errors: [
        {
          field: "product",
          message: "Product ID is required",
        },
      ],
    });
  }

  try {
    const productRepo = getRepository(Product);
    const product = await productRepo.findOne({
      product_id: req.params.product_id,
    });

    if (product) {
      return res.json({
        ok: true,
        data: product,
        errors: [],
      });
    } else {
      return res.status(400).json({
        ok: false,
        data: null,
        errors: [
          {
            field: "product",
            message: "Product not found",
          },
        ],
      });
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

// check if product exists
export const isProduct = async (product_id: string): Promise<boolean> => {
  try {
    const productRepo = getRepository(Product);
    const product = await productRepo.findOne({
      product_id,
    });

    if (!product) return false;
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

/**
 * ONLY FOR DEVELOPMENT
 */
router.post("/add", async (req, res) => {
  try {
    const { title, price, description, metadata, category, image } = req.body;
    const repo = getRepository(Product);
    const p = repo.create({
      category,
      description,
      image,
      metadata,
      price,
      title,
    });

    const result = await repo.save(p);
    res.json(result);
  } catch (error) {
    console.error(error);
  }
});

export default router;
