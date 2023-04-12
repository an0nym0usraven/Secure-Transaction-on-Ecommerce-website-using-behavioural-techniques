import axios from "axios";

interface VerifyOTPAgs {
  email: string;
  otp: string | null;
}

export const useVerifyOTP = async (args: VerifyOTPAgs) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/otp`,
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
