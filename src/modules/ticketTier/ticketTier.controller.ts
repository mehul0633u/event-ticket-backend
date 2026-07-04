import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { sendSuccess } from "../../utils/apiResponse.js";
import { MESSAGES } from "../../constants/constant.js";
import type {
  ICreateTierServiceInput,
  IDeactivateTierServiceInput,
  IGetTierServiceInput,
  IListTiersServiceInput,
  IUpdateTierServiceInput,
} from "./ticketTier.types.js";
import {
  createTierService,
  deactivateTierService,
  getTierService,
  listTiersService,
  updateTierService,
} from "./ticketTier.service.js";

export const createTierController = async (req: Request, res: Response) => {
  const eventId = req.params.eventId as string;
  const userId = req.userId as string;
  const createTierInput: ICreateTierServiceInput = {
    eventId,
    userId,
    body: req.body,
  };

  const tier = await createTierService(createTierInput);

  return sendSuccess(res, {
    statusCode: StatusCodes.CREATED,
    message: MESSAGES.TICKET_TIER.TICKET_TIER_CREATED_SUCCESS,
    data: tier,
  });
};

export const listTiersController = async (req: Request, res: Response) => {
  const eventId = req.params.eventId as string;
  const includeInactive = req.query.include_inactive === "true";
  const listTiersInput: IListTiersServiceInput = {
    eventId,
    includeInactive,
  };

  const tiers = await listTiersService(listTiersInput);

  return sendSuccess(res, {
    statusCode: StatusCodes.OK,
    message: MESSAGES.TICKET_TIER.TICKET_TIERS_RETRIEVED_SUCCESS,
    data: tiers,
    meta: {
      total: tiers.length,
      event_id: eventId,
    },
  });
};

export const getTierController = async (req: Request, res: Response) => {
  const tierId = req.params.tierId as string;
  const getTierInput: IGetTierServiceInput = {
    tierId,
  };

  const tier = await getTierService(getTierInput);

  return sendSuccess(res, {
    statusCode: StatusCodes.OK,
    message: MESSAGES.TICKET_TIER.TICKET_TIERS_RETRIEVED_SUCCESS,
    data: tier,
  });
};

export const updateTierController = async (req: Request, res: Response) => {
  const tierId = req.params.tierId as string;
  const userId = req.userId as string;
  const updateTierInput: IUpdateTierServiceInput = {
    tierId,
    userId,
    body: req.body,
  };

  const tier = await updateTierService(updateTierInput);

  return sendSuccess(res, {
    statusCode: StatusCodes.OK,
    message: MESSAGES.TICKET_TIER.TICKET_TIER_UPDATED_SUCCESS,
    data: tier,
  });
};

export const deactivateTierController = async (req: Request, res: Response) => {
  const tierId = req.params.tierId as string;
  const userId = req.userId as string;
  const deactivateTierInput: IDeactivateTierServiceInput = {
    tierId,
    userId,
  };

  const result = await deactivateTierService(deactivateTierInput);

  return sendSuccess(res, {
    statusCode: StatusCodes.OK,
    message: MESSAGES.TICKET_TIER.TICKET_TIER_DEACTIVATED_SUCCESS,
    data: result,
  });
};
