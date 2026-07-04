import type {
  Event,
  Prisma,
  TicketTier,
} from "../../../generated/prisma/client.js";

export interface ICreateTierBody {
  name: string;
  description?: string;
  price: number;
  currency?: "INR";
  total_quantity: number;
  max_per_user?: number;
  sale_starts_at?: string;
  sale_ends_at?: string;
}

export interface IUpdateTierBody {
  name?: string;
  description?: string;
  price?: number;
  total_quantity?: number;
  max_per_user?: number;
  sale_starts_at?: string;
  sale_ends_at?: string;
}

export interface ICreateTierServiceInput {
  eventId: string;
  userId: string;
  body: ICreateTierBody;
}

export interface ICreateTierDaoInput {
  eventId: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  totalQuantity: number;
  maxPerUser: number;
  saleStartsAt: Date;
  saleEndsAt: Date;
}

export interface IListTiersServiceInput {
  eventId: string;
  includeInactive: boolean;
}

export interface IListTiersDaoInput {
  eventId: string;
  showInactive: boolean;
}

export interface IGetTierServiceInput {
  tierId: string;
}

export interface IUpdateTierServiceInput {
  tierId: string;
  userId: string;
  body: IUpdateTierBody;
}

export interface IUpdateTierDaoInput {
  id: string;
  data: Prisma.TicketTierUpdateInput;
}

export interface IDeactivateTierServiceInput {
  tierId: string;
  userId: string;
}

export interface IFindEventByIdDaoInput {
  id: string;
}

export interface IFindTierByIdDaoInput {
  id: string;
}

export interface IFindTierWithEventDaoInput {
  id: string;
}

export interface IFindTierByNameInEventDaoInput {
  eventId: string;
  name: string;
  excludeId?: string;
}

export interface ICountActiveTiersDaoInput {
  eventId: string;
}

export interface IDeactivateTierResult {
  id: string;
  isActive: boolean;
}

export interface ITierResponse extends TicketTier {
  available: number;
}

export interface ITierDetailResponse {
  event: {
    id: string;
    title: string;
    startsAt: Date;
    status: string;
  };
  available: number;
  is_sale_open: boolean;
  id: string;
  eventId: string;
  name: string;
  description: string | null;
  price: Prisma.Decimal;
  currency: string;
  totalQuantity: number;
  soldCount: number;
  reservedCount: number;
  maxPerUser: number;
  saleStartsAt: Date | null;
  saleEndsAt: Date | null;
  isActive: boolean;
}

export interface IListTiersMeta {
  total: number;
  event_id: string;
}

export type TEventRecord = Event;
