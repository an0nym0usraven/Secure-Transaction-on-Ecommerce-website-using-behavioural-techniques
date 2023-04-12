import { Request, Response, NextFunction } from "express";

export const isAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userID) {
    return res.status(401).json({
      ok: false,
      data: null,
      errors: [
        {
          field: "auth",
          message: "User not authenticated",
        },
      ],
    });
  }

  return next();
};
