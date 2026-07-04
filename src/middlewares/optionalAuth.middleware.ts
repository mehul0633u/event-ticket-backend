import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { prisma } from "../config/prisma.js";
import { JWT_AUDIENCE, JWT_ISSUER, JWT_SECRET } from "../config/env.js";

type UserTokenPayload = JwtPayload & {
  userId: string;
  role: string;
};

export const optionalAuth = async (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return next();
  }

  try {
    const payload = jwt.verify(authHeader.slice(7), JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    }) as UserTokenPayload;

    const user = await prisma.user.findFirst({
      where: {
        id: payload.userId,
        isActive: true,
        deletedAt: null,
      },
      select: {
        id: true,
        role: {
          select: { title: true },
        },
      },
    });

    if (user) {
      req.userId = payload.userId;
      req.userRole = user.role.title;
    }
  } catch (error) {
    // Ignore errors for optional auth
  }

  return next();
};
