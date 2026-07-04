import { UserUpdateInput } from "../../../generated/prisma/models.js";
import { prisma } from "../../config/prisma.js";
import { ICreateUserInput } from "./auth.types.js";

const publicUserSelect = {
  id: true,
  email: true,
  fullName: true,
  phone: true,
  isVerified: true,
  isActive: true,
  createdAt: true,
  role: { select: { title: true } },
} as const;

export const findExistingUserDao = (email: string, phone?: string) =>
  prisma.user.findFirst({
    where: {
      OR: [{ email }, ...(phone ? [{ phone }] : [])],
    },
    select: { email: true, phone: true },
  });

export const findRoleByTitleDao = (title: string) =>
  prisma.role.findUnique({ where: { title } });

export const createUserDao = (input: ICreateUserInput) =>
  prisma.user.create({
    data: {
      ...input,
      isVerified: true,
      isActive: true,
    },
    select: publicUserSelect,
  });

export const findLoginUserByEmailDao = (email: string) =>
  prisma.user.findFirst({
    where: { email, deletedAt: null },
    select: { ...publicUserSelect, passwordHash: true },
  });

export const findProfileByIdDao = (userId: string) =>
  prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
    select: {
      ...publicUserSelect,
      role: {
        select: {
          title: true,
          permissions: {
            select: { permission: { select: { title: true } } },
          },
        },
      },
    },
  });

export const updatePaymentDao = async (
  userId: string,
  data: UserUpdateInput,
) => {
  return await prisma.user.update({
    where: {
      id: userId,
    },
    data,
  });
};
