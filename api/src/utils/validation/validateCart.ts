import validator from "validator";
import { isCartItem } from "../../api/cart/cart";
import { isProduct } from "../../api/product/product";
import { ValidationError } from "./validateAuth";

interface ValidateCartArgs {
  creator: string;
  product_id: string;
  qty: number;
}

export const validateCart = async (args: ValidateCartArgs) => {
  const { creator, product_id, qty } = args;
  let errors: ValidationError[] = [];

  if (typeof product_id === "undefined") {
    errors.push({
      field: "product_id",
      message: "Product ID is missing",
    });
  } else {
    if (validator.isEmpty(product_id)) {
      errors.push({
        field: "product_id",
        message: "Product ID is required",
      });
    }

    if (!validator.isUUID(product_id)) {
      errors.push({
        field: "product_id",
        message: "Product ID is not a valid UUID",
      });
    }

    const isProductCheck = await isProduct(product_id);
    if (!isProductCheck) {
      errors.push({
        field: "product",
        message: "Product does not exist",
      });
    }

    const isCartItemCheck = await isCartItem(creator, product_id);
    if (isCartItemCheck) {
      errors.push({
        field: "cart",
        message: "Product already in cart",
      });
    }
  }

  if (typeof qty === "undefined") {
    errors.push({
      field: "qty",
      message: "Quantity is missing",
    });
  } else {
    if (validator.isEmpty(qty.toString())) {
      errors.push({
        field: "qty",
        message: "Quantity is required",
      });
    }
  }

  return errors;
};
