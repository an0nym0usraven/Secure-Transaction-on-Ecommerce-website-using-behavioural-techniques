import axios from "axios";

export const useGetCart = async () => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/cart`,
      {
        withCredentials: true,
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
