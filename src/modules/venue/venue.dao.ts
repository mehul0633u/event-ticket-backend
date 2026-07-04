import { ICreateVenueInput } from "./venue.types.js";
import { prisma } from "../../config/prisma.js";
import { EventStatus } from "../../../generated/prisma/enums.js";

export const createVenueDao = async ({
  name,
  address,
  city,
  organizerId,
}: ICreateVenueInput) => {
  const newVenue = await prisma.venue.create({
    data: {
      name,
      address,
      city,
      createdById: organizerId,
    },
  });
  return newVenue;
};

export const getVenuesDao = async () => {
  const venues = await prisma.venue.findMany({
    select: {
      id: true,
      name: true,
      address: true,
      city: true,
    },
  });
  return venues;
};

export const deleteVenueDao = async (id: string) => {
  return await prisma.venue.delete({
    where: {
      id,
      events: {
        none: {
          status: EventStatus.approved,
        },
      },
    },
  });
};
