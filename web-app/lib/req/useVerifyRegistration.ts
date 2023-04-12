import axios from "axios";
import { RegistrationCredentialJSON } from "@simplewebauthn/typescript-types";

interface VerifyRegistrationArgs {
  options: RegistrationCredentialJSON;
}

export const useVerifyRegistration = async (args: VerifyRegistrationArgs) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-registration`,
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
