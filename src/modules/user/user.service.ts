import { StatusCodes } from "http-status-codes";
import { apiError } from "../../utils/apiError.js";
import {
  getUsersDao,
  getUsersByIdDao,
  changeStatusDao,
  changeRoleDao,
} from "./user.dao.js";
import type {
  IChangeRoleServiceInput,
  IChangeStatusServiceInput,
} from "./user.types.js";
import { MESSAGES } from "../../constants/constant.js";
import { ROLES } from "../../constants/authorization.js";

export const getUsersService = async () => {
  const users = await getUsersDao();

  return users;
};

export const getUsersByIdService = async ({ id }: { id: string }) => {
  const user = await getUsersByIdDao({ id });

  return user;
};

export const changeStatusService = async ({
  isActive,
  id,
}: IChangeStatusServiceInput) => {
  const user = await changeStatusDao({ isActive, id });

  return user;
};

export const changeRoleService = async ({
  role,
  id,
}: IChangeRoleServiceInput) => {
  const targetUser = await getUsersByIdDao({ id });
  if (!targetUser) {
    throw apiError(StatusCodes.NOT_FOUND, MESSAGES.AUTH.USER_NOT_FOUND);
  }

  if (targetUser.role.title === ROLES.ADMIN) {
    throw apiError(
      StatusCodes.FORBIDDEN,
      "Admin users cannot be modified by this endpoint",
    );
  }

  const user = await changeRoleDao({ role, id });

  return user;
};
