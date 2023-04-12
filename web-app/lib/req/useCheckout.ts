import axios from "axios";

interface CheckoutArgs {
  card_number: string;
  card_expiry: number;
  card_cvc: number;
  card_name: string;
}

export const useCheckout = async (args: CheckoutArgs) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/checkout/verify`,
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
