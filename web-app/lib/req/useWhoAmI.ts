import axios from "axios";

export const useWhoAmI = async () => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/user/whoami`,
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
