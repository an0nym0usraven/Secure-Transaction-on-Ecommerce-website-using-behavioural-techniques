import axios from "axios";
import https from "https";
interface RegisterArgs {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  fingerprint: string;
  TFA_auth: boolean;
}

export const useRegister = async (args: RegisterArgs) => {
  try {
    const agent = new https.Agent({
      rejectUnauthorized: false,
    });
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
      {
        args,
      },
      {
        withCredentials: true,
        httpsAgent: agent,
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
