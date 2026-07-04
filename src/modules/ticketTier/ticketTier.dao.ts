import type { TicketTier } from "../../../generated/prisma/client.js";
import { prisma } from "../../config/prisma.js";
import type {
  ICountActiveTiersDaoInput,
  ICreateTierDaoInput,
  IFindEventByIdDaoInput,
  IFindTierByIdDaoInput,
  IFindTierByNameInEventDaoInput,
  IFindTierWithEventDaoInput,
  IListTiersDaoInput,
  IUpdateTierDaoInput,
  TEventRecord,
} from "./ticketTier.types.js";

export async function findEventById({
  id,
}: IFindEventByIdDaoInput): Promise<TEventRecord | null> {
  return prisma.event.findUnique({ where: { id } });
}

export async function findTierById({ id }: IFindTierByIdDaoInput) {
  return prisma.ticketTier.findUnique({ where: { id } });
}

export async function findTierWithEvent({ id }: IFindTierWithEventDaoInput) {
  return prisma.ticketTier.findUnique({
    where: { id },
    include: { event: true },
  });
}

export async function findTierWithEventSelect({
  id,
}: IFindTierWithEventDaoInput) {
  return prisma.ticketTier.findUnique({
    where: { id },
    include: {
      event: {
        select: { id: true, title: true, startsAt: true, status: true },
      },
    },
  });
}

export async function findTierByNameInEvent(
  { eventId, name, excludeId }: IFindTierByNameInEventDaoInput,
) {
  return prisma.ticketTier.findFirst({
    where: {
      eventId,
      name: { equals: name, mode: "insensitive" },
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
  });
}

export async function createTier(data: ICreateTierDaoInput): Promise<TicketTier> {
  return prisma.ticketTier.create({ data });
}

export async function listTiers({ eventId, showInactive }: IListTiersDaoInput) {
  return prisma.ticketTier.findMany({
    where: { eventId, ...(showInactive ? {} : { isActive: true }) },
    orderBy: { price: "asc" },
  });
}

export async function updateTier({ id, data }: IUpdateTierDaoInput) {
  return prisma.ticketTier.update({ where: { id }, data });
}

export async function countActiveTiers({ eventId }: ICountActiveTiersDaoInput) {
  return prisma.ticketTier.count({ where: { eventId, isActive: true } });
}
