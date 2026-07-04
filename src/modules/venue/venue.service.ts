import { ICreateVenueInput } from "./venue.types.js";
import { createVenueDao, getVenuesDao, deleteVenueDao } from "./venue.dao.js";
import { apiError } from "../../utils/apiError.js";
import { StatusCodes } from "http-status-codes";
import { MESSAGES } from "../../constants/constant.js";

export const createVenueService = async ({
  name,
  address,
  city,
  organizerId,
}: ICreateVenueInput) => {
  const newVenue = await createVenueDao({
    name,
    address,
    city,
    organizerId,
  });

  return newVenue;
};

export const getVenuesService = async () => {
  const venues = await getVenuesDao();
  return venues;
};

export const deleteVenueService = async (id: string) => {
  const venue = await deleteVenueDao(id);
  return venue;
};
