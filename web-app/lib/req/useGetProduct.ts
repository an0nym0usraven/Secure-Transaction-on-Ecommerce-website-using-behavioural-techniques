import axios from "axios";
import https from "https";

export const useGetProduct = async (
  product_id: string | string[] | undefined
) => {
  try {
    const agent = new https.Agent({
      rejectUnauthorized: false,
    });
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/product/id/${encodeURIComponent(
        product_id as string
      )}`,
      {
        httpsAgent: agent,
      }
    );
    return {
      data: response.data,
    };
  } catch (error) {
    return {
      error: error,
    };
  }
};
