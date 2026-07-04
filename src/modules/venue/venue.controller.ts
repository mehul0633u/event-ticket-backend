import { Request, Response } from "express";
import { sendSuccess } from "../../utils/apiResponse.js";
import {
  createVenueService,
  getVenuesService,
  deleteVenueService,
} from "./venue.service.js";
import { StatusCodes } from "http-status-codes";
import { MESSAGES } from "../../constants/constant.js";
import { apiError } from "../../utils/apiError.js";

export const createVenueController = async (req: Request, res: Response) => {
  const { name, address, city } = req.body;
  const organizerId = req.userId;

  if (!organizerId) {
    throw apiError(
      StatusCodes.UNAUTHORIZED,
      MESSAGES.AUTH.AUTHENTICATION_REQUIRED,
    );
  }

  const newVanue = await createVenueService({
    name,
    address,
    city,
    organizerId,
  });

  return sendSuccess(res, {
    statusCode: StatusCodes.CREATED,
    message: MESSAGES.VENUE.VENUE_CREATED_SUCCESS,
    data: newVanue,
  });
};

export const getVenuesController = async (req: Request, res: Response) => {
  const venues = await getVenuesService();

  return sendSuccess(res, {
    statusCode: StatusCodes.OK,
    message: MESSAGES.VENUE.VENUES_RETRIEVED_SUCCESS,
    data: venues,
  });
};

export const deleteVenueController = async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const venue = await deleteVenueService(id);

  sendSuccess(res, {
    statusCode: StatusCodes.OK,
    message: MESSAGES.VENUE.VENUE_DELETED_SUCCESS,
    data: venue,
  });
};
