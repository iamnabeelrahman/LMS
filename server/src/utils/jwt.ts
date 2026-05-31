import "dotenv/config";
import jwt, { SignOptions } from "jsonwebtoken";
import { IUser } from "../db/schema/users.schema.js";
import { ITokenOptions, JwtPayload } from "../modules/auth/auth.types.js";


export const generateToken = (
  payload: object,
  expiresIn: string = "5m",
  token: string,
): string => {
  const options: SignOptions = {
    expiresIn: expiresIn as unknown as jwt.SignOptions["expiresIn"],
  };
  return jwt.sign(payload, token as string, options);
};

export const verifyToken = (
  token: string,
  secret: string,
): JwtPayload | null => {
  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    return decoded;
  } catch (error) {
    return null; // token invalid or expired
  }
};
