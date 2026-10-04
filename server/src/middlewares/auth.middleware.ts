import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/apperror";

interface AccessTokenPayload {
    sub: string;
    type: "access";
}

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

if (!JWT_ACCESS_SECRET) {
    throw new Error("JWT_ACCESS_SECRET is not defined");
}

export const authMiddleware = (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    try {
        const authorization = req.headers.authorization;

        if (!authorization) {
            throw new AppError(
                401,
                "Authentication required"
            );
        }

        const [scheme, token, ...extra] = authorization.split(" ");

        if (scheme !== "Bearer" || !token || extra.length > 0) {
            return next(new AppError(
                401,
                "Invalid authorization header"
            ));
        }

        const decoded = jwt.verify(
            token,
            JWT_ACCESS_SECRET
        ) as AccessTokenPayload;

        if (decoded.type !== "access" || !decoded.sub) {
            throw new Error("Invalid access token payload");
        }

        req.user = { id: decoded.sub };

        next();
    } catch (error) {
        next(
            new AppError(
                401,
                "Authentication required"
            )
        );
    }
};
