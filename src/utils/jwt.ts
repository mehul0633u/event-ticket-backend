import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";

import {
  JWT_ACCESS_EXPIRES,
  JWT_AUDIENCE,
  JWT_ISSUER,
  JWT_SECRET,
} from "../config/env.js";

export type AccessTokenPayload = {
  userId: string;
  role: string;
};

export const signAccessToken = (payload: AccessTokenPayload): string =>
  jwt.sign(payload, JWT_SECRET, {
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
    expiresIn: JWT_ACCESS_EXPIRES as SignOptions["expiresIn"],
  });
