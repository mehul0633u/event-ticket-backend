import { prisma } from "../../config/prisma";
import { ROLES } from "../../constants/authorization";
import { apiError } from "../../utils/apiError";
import { StatusCodes } from "http-status-codes";
import { MESSAGES } from "../../constants/constant";
import type {
  IChangeRoleServiceInput,
  IChangeStatusServiceInput,
} from "./user.types";

export const getUsersDao = async () => {
  return await prisma.user.findMany({
    where: {
      role: {
        title: {
          notIn: [ROLES.ADMIN],
        },
      },
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: {
        select: {
          title: true,
        },
      },
      isVerified: true,
      isActive: true,
      createdAt: true,
    },
  });
};

export const getUsersByIdDao = async ({ id }: { id: string }) => {
  return await prisma.user.findFirst({
    where: {
      id,
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: {
        select: {
          title: true,
        },
      },
      isVerified: true,
      isActive: true,
      createdAt: true,
    },
  });
};

export const changeStatusDao = async ({
  isActive,
  id,
}: IChangeStatusServiceInput) => {
  return await prisma.user.update({
    where: {
      id,
    },
    data: {
      isActive,
    },
    select: {
      id: true,
      isActive: true,
    },
  });
};

export const changeRoleDao = async ({
  role,
  id,
}: IChangeRoleServiceInput) => {
  const roleRecord = await prisma.role.findUnique({
    where: {
      title: role,
    },
    select: {
      id: true,
      title: true,
    },
  });

  if (!roleRecord) {
    throw apiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      MESSAGES.COMMON.INTERNAL_SERVER_ERROR,
    );
  }

  return await prisma.user.update({
    where: {
      id,
    },
    data: {
      roleId: roleRecord.id,
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: {
        select: {
          title: true,
        },
      },
      isVerified: true,
      isActive: true,
      createdAt: true,
    },
  });
};
