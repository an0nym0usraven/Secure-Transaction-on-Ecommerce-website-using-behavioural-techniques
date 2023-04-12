import validator from "validator";

interface ValidateRegisterArgs {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

interface ValidateLoginArgs {
  email: string;
  password: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export const validateRegister = (args: ValidateRegisterArgs) => {
  const { email, password, first_name, last_name } = args;
  let errors: ValidationError[] = [];

  if (typeof email === "undefined") {
    errors.push({
      field: "email",
      message: "Email field is missing",
    });
  } else {
    if (validator.isEmpty(email)) {
      errors.push({
        field: "email",
        message: "Email is required",
      });
    }

    if (!validator.isEmail(email)) {
      errors.push({
        field: "email",
        message: "Please provide a valid email",
      });
    }
  }

  if (typeof password === "undefined") {
    errors.push({
      field: "password",
      message: "Password field is missing",
    });
  } else {
    if (validator.isEmpty(password)) {
      errors.push({
        field: "password",
        message: "Password is required",
      });
    }

    if (!validator.isLength(password, { min: 8 })) {
      errors.push({
        field: "password",
        message: "Password must be at least 8 characters long",
      });
    }
  }

  if (typeof first_name === "undefined") {
    errors.push({
      field: "first_name",
      message: "First name is missing",
    });
  } else {
    if (validator.isEmpty(first_name)) {
      errors.push({
        field: "first_name",
        message: "First name is required",
      });
    }
  }

  if (typeof last_name === "undefined") {
    errors.push({
      field: "last_name",
      message: "Last name is missing",
    });
  } else {
    if (validator.isEmpty(last_name)) {
      errors.push({
        field: "last_name",
        message: "Last name is required",
      });
    }
  }

  return errors;
};

export const validateLogin = (args: ValidateLoginArgs) => {
  const { email, password } = args;
  let errors: ValidationError[] = [];

  if (typeof email === "undefined") {
    errors.push({
      field: "email",
      message: "Email field is missing",
    });
  } else {
    if (validator.isEmpty(email)) {
      errors.push({
        field: "email",
        message: "Email is required",
      });
    }

    if (!validator.isEmail(email)) {
      errors.push({
        field: "email",
        message: "Please provide a valid email",
      });
    }
  }

  if (typeof password === "undefined") {
    errors.push({
      field: "password",
      message: "Password field is missing",
    });
  } else {
    if (validator.isEmpty(password)) {
      errors.push({
        field: "password",
        message: "Password is required",
      });
    }
  }

  return errors;
};
