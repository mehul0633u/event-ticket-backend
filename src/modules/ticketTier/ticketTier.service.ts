import type { TicketTier } from "../../../generated/prisma/client.js";
import { StatusCodes } from "http-status-codes";
import { apiError } from "../../utils/apiError.js";
import { TICKET_TIER_ERRORS } from "./ticketTier.errors.js";
import * as dao from "./ticketTier.dao.js";
import { MESSAGES } from "../../constants/constant.js";
import type {
  ICreateTierServiceInput,
  IDeactivateTierServiceInput,
  IGetTierServiceInput,
  IListTiersServiceInput,
  IUpdateTierServiceInput,
} from "./ticketTier.types.js";

const computeAvailable = (tier: TicketTier): number => {
  return tier.totalQuantity - tier.soldCount - tier.reservedCount;
};

const computeIsSaleOpen = (tier: TicketTier): boolean => {
  const now = new Date();
  const afterStart = !tier.saleStartsAt || now >= tier.saleStartsAt;
  const beforeEnd = !tier.saleEndsAt || now <= tier.saleEndsAt;
  return tier.isActive && afterStart && beforeEnd && computeAvailable(tier) > 0;
};

export const createTierService = async ({
  eventId,
  userId,
  body,
}: ICreateTierServiceInput) => {
  const event = await dao.findEventById({ id: eventId });
  if (!event) {
    throw apiError(StatusCodes.NOT_FOUND, MESSAGES.EVENT.EVENT_NOT_FOUND);
  }

  if (event.organizerId !== userId) {
    throw apiError(StatusCodes.FORBIDDEN, MESSAGES.TICKET_TIER.FORBIDDEN);
  }

  if (!["draft", "pending", "approved"].includes(event.status)) {
    throw apiError(
      StatusCodes.CONFLICT,
      MESSAGES.TICKET_TIER.EVENT_NOT_EDITABLE,
    );
  }

  if (body.sale_ends_at && new Date(body.sale_ends_at) > event.startsAt) {
    throw apiError(
      StatusCodes.BAD_REQUEST,
      MESSAGES.TICKET_TIER.SALE_END_AFTER_EVENT_START,
    );
  }

  const existing = await dao.findTierByNameInEvent({
    eventId,
    name: body.name,
  });
  if (existing) {
    throw apiError(StatusCodes.CONFLICT, MESSAGES.TICKET_TIER.TIER_NAME_EXISTS);
  }

  const tier = await dao.createTier({
    eventId,
    name: body.name,
    description: body.description,
    price: body.price,
    currency: body.currency ?? "INR",
    totalQuantity: body.total_quantity,
    maxPerUser: body.max_per_user ?? 5,
    saleStartsAt: body.sale_starts_at
      ? new Date(body.sale_starts_at)
      : new Date(),
    saleEndsAt: body.sale_ends_at
      ? new Date(body.sale_ends_at)
      : event.startsAt,
  });

  return { ...tier, available: computeAvailable(tier) };
};

export const listTiersService = async ({
  eventId,
  includeInactive,
}: IListTiersServiceInput) => {
  const event = await dao.findEventById({ id: eventId });
  if (!event) {
    throw apiError(StatusCodes.NOT_FOUND, MESSAGES.EVENT.EVENT_NOT_FOUND);
  }
  const showInactive = includeInactive;
  const tiers = await dao.listTiers({ eventId, showInactive });

  return tiers.map((tier) => ({
    ...tier,
    available: computeAvailable(tier),
    is_sale_open: computeIsSaleOpen(tier),
  }));
};

export const getTierService = async ({ tierId }: IGetTierServiceInput) => {
  const tier = await dao.findTierWithEventSelect({ id: tierId });

  if (!tier) {
    throw apiError(
      StatusCodes.NOT_FOUND,
      MESSAGES.TICKET_TIER.TICKET_TIER_NOT_FOUND,
    );
  }

  return {
    ...tier,
    available: computeAvailable(tier),
    is_sale_open: computeIsSaleOpen(tier),
  };
};

export const updateTierService = async ({
  tierId,
  userId,
  body,
}: IUpdateTierServiceInput) => {
  const tier = await dao.findTierWithEvent({ id: tierId });
  if (!tier) {
    throw apiError(
      StatusCodes.NOT_FOUND,
      "Tier doesn't exist",
      TICKET_TIER_ERRORS.TIER_NOT_FOUND,
    );
  }

  if (tier.event.organizerId !== userId) {
    throw apiError(
      StatusCodes.FORBIDDEN,
      "Not your event",
      TICKET_TIER_ERRORS.FORBIDDEN,
    );
  }

  if (tier.event.status === "cancelled") {
    throw apiError(
      StatusCodes.FORBIDDEN,
      "Event is cancelled",
      TICKET_TIER_ERRORS.EVENT_CANCELLED,
    );
  }

  if (body.price !== undefined && tier.soldCount > 0) {
    throw apiError(
      StatusCodes.CONFLICT,
      "Cannot change price after tickets are sold",
      TICKET_TIER_ERRORS.PRICE_CHANGE_BLOCKED,
    );
  }

  if (body.total_quantity !== undefined) {
    const minAllowed = tier.soldCount + tier.reservedCount;
    if (body.total_quantity < minAllowed) {
      throw apiError(
        StatusCodes.CONFLICT,
        `New qty < sold + reserved (${minAllowed})`,
        `QUANTITY_TOO_LOW:${minAllowed}`,
      );
    }
  }

  if (body.name) {
    const duplicate = await dao.findTierByNameInEvent({
      eventId: tier.eventId,
      name: body.name,
      excludeId: tierId,
    });
    if (duplicate) {
      throw apiError(
        StatusCodes.CONFLICT,
        "Duplicate name in event",
        TICKET_TIER_ERRORS.TIER_NAME_EXISTS,
      );
    }
  }

  const updated = await dao.updateTier({
    id: tierId,
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.price !== undefined && { price: body.price }),
      ...(body.total_quantity !== undefined && {
        totalQuantity: body.total_quantity,
      }),
      ...(body.max_per_user !== undefined && { maxPerUser: body.max_per_user }),
      ...(body.sale_starts_at !== undefined && {
        saleStartsAt: new Date(body.sale_starts_at),
      }),
      ...(body.sale_ends_at !== undefined && {
        saleEndsAt: new Date(body.sale_ends_at),
      }),
    },
  });

  return { ...updated, available: computeAvailable(updated) };
};

export const deactivateTierService = async ({
  tierId,
  userId,
}: IDeactivateTierServiceInput) => {
  const tier = await dao.findTierWithEvent({ id: tierId });
  if (!tier) {
    throw apiError(
      StatusCodes.NOT_FOUND,
      "Tier doesn't exist",
      TICKET_TIER_ERRORS.TIER_NOT_FOUND,
    );
  }

  if (tier.event.organizerId !== userId) {
    throw apiError(
      StatusCodes.FORBIDDEN,
      "Not your event",
      TICKET_TIER_ERRORS.FORBIDDEN,
    );
  }

  if (!tier.isActive) {
    return { id: tier.id, isActive: false };
  }

  const activeCount = await dao.countActiveTiers({ eventId: tier.eventId });
  if (activeCount <= 1) {
    throw apiError(
      StatusCodes.CONFLICT,
      "Only one active tier left on event",
      TICKET_TIER_ERRORS.LAST_ACTIVE_TIER,
    );
  }

  const updated = await dao.updateTier({
    id: tierId,
    data: { isActive: false },
  });

  return { id: updated.id, isActive: updated.isActive };
};
