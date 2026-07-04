import { EventStatus } from "../../../generated/prisma/enums";

export interface ICreateEventServiceInput {
  title: string;
  description?: string;
  bannerUrl?: string;
  categoryId?: string;
  venueId?: string;
  startsAt: Date;
  endsAt: Date;
  organizerId: string;
}

export interface ICreateEventDaoInput extends ICreateEventServiceInput {}

export interface IGetEventsServiceInput {
  page: number;
  limit: number;
  search?: string;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}

export interface IGetEventsDaoInput extends IGetEventsServiceInput {}

export interface IGetEventByIdServiceInput {
  id: string;
}

export interface IGetEventByIdDaoInput extends IGetEventByIdServiceInput {}

export interface IGetEventsResult<T> {
  events: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface IEventApproveRejectServiceInput {
  userId: string;
  eventId: string;
  status: EventStatus;
  reason?: string;
}
