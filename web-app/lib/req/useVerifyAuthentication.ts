import { AuthenticationCredentialJSON } from "@simplewebauthn/typescript-types";
import axios from "axios";

interface VerifyAuthenticationArgs {
  options: AuthenticationCredentialJSON;
}

export const useVerifyAuthentication = async (
  args: VerifyAuthenticationArgs
) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-authentication`,
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
