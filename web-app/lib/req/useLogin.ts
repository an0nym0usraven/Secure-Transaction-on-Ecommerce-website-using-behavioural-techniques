import axios from "axios";

interface LoginArgs {
  email: string;
  password: string;
  fingerprint: string;
}

export const useLogin = async (args: LoginArgs) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
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
