import axios from "axios";

export const useLogOut = async () => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`,
      {
        withCredentials: true,
      }
    );
    return {
      data: response.data,
      error: undefined,
    };
  } catch (error) {
    return {
      data: undefined,
      error: error,
    };
  }
};
