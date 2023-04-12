import axios, { AxiosError } from "axios";
import https from "https";

export const useGetAllProducts = async () => {
  try {
    const agent = new https.Agent({
      rejectUnauthorized: false,
    });
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/product`,
      {
        httpsAgent: agent,
      }
    );
    return {
      data: response.data,
    };
  } catch (error) {
    return {
      error: error as AxiosError,
    };
  }
};
