import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_ACCESS_SECRET;

if (!JWT_SECRET) {
    throw new Error("JWT Secret is not defined");
}

export const generateAccessToken = (payload: {
    userId: string;
}) => {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: "15m",
    });
};