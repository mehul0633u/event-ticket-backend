import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";

import { prisma } from "../config/prisma.js";
import { MESSAGES } from "../constants/constant.js";
import type { PermissionTitle } from "../constants/authorization.js";
import { JWT_AUDIENCE, JWT_ISSUER, JWT_SECRET } from "../config/env.js";
import { apiError } from "../utils/apiError.js";

type UserTokenPayload = JwtPayload & {
  userId: string;
  role: string;
};

export const auth =
  (requiredPermission?: PermissionTitle): RequestHandler =>
  async (req, _res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return next(
        apiError(
          StatusCodes.UNAUTHORIZED,
          MESSAGES.AUTH.BEARER_TOKEN_REQUIRED,
        ),
      );
    }

    let payload: UserTokenPayload;

    try {
      payload = jwt.verify(authHeader.slice(7), JWT_SECRET, {
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
      }) as UserTokenPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return next(
          apiError(StatusCodes.UNAUTHORIZED, MESSAGES.AUTH.TOKEN_EXPIRED),
        );
      }

      if (error instanceof jwt.JsonWebTokenError) {
        return next(
          apiError(StatusCodes.UNAUTHORIZED, MESSAGES.AUTH.INVALID_TOKEN),
        );
      }

      return next(error);
    }

    try {
      const user = await prisma.user.findFirst({
        where: {
          id: payload.userId,
          isActive: true,
          deletedAt: null,
        },
        select: {
          id: true,
          role: {
            select: {
              title: true,
              permissions: {
                select: {
                  permission: {
                    select: {
                      title: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!user) {
        return next(
          apiError(
            StatusCodes.UNAUTHORIZED,
            MESSAGES.AUTH.USER_NOT_FOUND_OR_INACTIVE,
          ),
        );
      }

      const permissions = user.role.permissions.map(
        ({ permission }) => permission.title,
      );

      req.userId = payload.userId;
      req.userRole = user.role.title;
      req.permissions = permissions;

      if (requiredPermission && !permissions.includes(requiredPermission)) {
        return next(
          apiError(StatusCodes.FORBIDDEN, MESSAGES.AUTH.ACCESS_DENIED),
        );
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
