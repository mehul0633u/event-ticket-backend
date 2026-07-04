import { prisma } from "../../config/prisma.js";
import type { ICreateEventCategoryInput } from "./eventCategory.types.js";

const eventCategorySelect = {
  id: true,
  name: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const findEventCategoryByNameDao = (name: string) =>
  prisma.eventCategory.findUnique({
    where: { name },
    select: { id: true },
  });

export const createEventCategoryDao = (input: ICreateEventCategoryInput) =>
  prisma.eventCategory.create({
    data: input,
    select: eventCategorySelect,
  });

export const getEventCategoriesDao = () =>
  prisma.eventCategory.findMany({
    where: { isActive: true },
    select: eventCategorySelect,
    orderBy: { name: "asc" },
  });
