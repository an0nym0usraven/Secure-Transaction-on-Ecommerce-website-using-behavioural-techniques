import axios from "axios";

interface AddToCartArgs {
  product_id: string;
  qty: number;
}

export const useAddToCart = async (args: AddToCartArgs) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/cart`,
      {
        args,
      },
      {
        withCredentials: true,
      }
    );
    return {
      data: response.data,
      error: undefined,
    };
  } catch (error: any) {
    return {
      data: undefined,
      error: error,
    };
  }
};
