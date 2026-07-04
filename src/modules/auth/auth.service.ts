import bcrypt from "bcryptjs";
import { StatusCodes } from "http-status-codes";
import { ROLES } from "../../constants/authorization.js";
import { MESSAGES } from "../../constants/constant.js";
import { apiError } from "../../utils/apiError.js";
import { signAccessToken } from "../../utils/jwt.js";
import {
  findExistingUserDao,
  findRoleByTitleDao,
  createUserDao,
  findLoginUserByEmailDao,
  findProfileByIdDao,
  updatePaymentDao,
} from "./auth.dao.js";
import type { LoginInput, RegisterInput } from "./auth.types.js";
import { UserUpdateInput } from "../../../generated/prisma/models.js";

const toPublicUser = <T extends { role: { title: string } }>(user: T) => {
  const { role, ...profile } = user;
  return { ...profile, role: role.title };
};

export const registerService = async (input: RegisterInput) => {
  const { email, phone, password, fullName } = input;
  const existingUser = await findExistingUserDao(email, phone);

  if (existingUser?.email === email) {
    throw apiError(
      StatusCodes.CONFLICT,
      MESSAGES.AUTH.EMAIL_ALREADY_REGISTERED,
    );
  }
  if (phone && existingUser?.phone === phone) {
    throw apiError(
      StatusCodes.CONFLICT,
      MESSAGES.AUTH.PHONE_ALREADY_REGISTERED,
    );
  }

  const role = await findRoleByTitleDao(ROLES.USER);
  if (!role) {
    throw apiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      MESSAGES.AUTH.DEFAULT_USER_ROLE_NOT_CONFIGURED,
    );
  }

  const user = await createUserDao({
    email: email,
    passwordHash: await bcrypt.hash(password, 12),
    fullName: fullName,
    phone: phone,
    roleId: role.id,
  });

  return {
    accessToken: signAccessToken({ userId: user.id, role: user.role.title }),
    user: toPublicUser(user),
  };
};

export const loginService = async (input: LoginInput) => {
  const { email, password } = input;
  const user = await findLoginUserByEmailDao(email);

  if (
    !user ||
    !user.isActive ||
    !(await bcrypt.compare(password, user.passwordHash))
  ) {
    throw apiError(
      StatusCodes.UNAUTHORIZED,
      MESSAGES.AUTH.INVALID_EMAIL_OR_PASSWORD,
    );
  }

  const { passwordHash: _passwordHash, ...safeUser } = user;
  return {
    accessToken: signAccessToken({
      userId: safeUser.id,
      role: safeUser.role.title,
    }),
    user: toPublicUser(safeUser),
  };
};

export const getProfileService = async (userId: string) => {
  const user = await findProfileByIdDao(userId);

  if (!user) {
    throw apiError(StatusCodes.NOT_FOUND, MESSAGES.AUTH.USER_NOT_FOUND);
  }

  const { role, ...profile } = user;
  return {
    ...profile,
    role: role.title,
    permissions: role.permissions.map(({ permission }) => permission.title),
  };
};

export const updateMeService = async (
  userId: string,
  data: UserUpdateInput,
) => {
  return await updatePaymentDao(userId, data);
};
