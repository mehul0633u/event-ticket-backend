import { Prisma } from "../../../generated/prisma/client.js";
import {
  totalUserDao,
  totalEventDao,
  approvedEventDao,
  pendingEventDao,
  totalBookingDao,
  totalRevenueDao,
  activeEventDao,
  ticketsSoldDao,
  grossRevenueDao,
  upcomingEventDao,
  recentSaleDao,
  totalTicketsSoldDao,
  recentPaymentDao,
} from "./dashboard.dao.js";

export const adminDashboardService = async () => {
  const [
    totalUsers,
    totalEvents,
    approvedEvents,
    pendingEvents,
    totalBookings,
    totalRevenue,
  ] = await Promise.all([
    totalUserDao(),
    totalEventDao(),
    approvedEventDao(),
    pendingEventDao(),
    totalBookingDao(),
    totalRevenueDao(),
  ]);

  return {
    totalUsers,
    totalEvents,
    approvedEvents,
    pendingEvents,
    totalBookings,
    totalRevenue,
  };
};

export const organizerDashboardService = async (userId: string) => {
  const [activeEvents, ticketsSold, grossRevenue, upcomingEvents] =
    await Promise.all([
      activeEventDao(userId),
      ticketsSoldDao(userId),
      grossRevenueDao(userId),
      upcomingEventDao(userId),
    ]);

  return {
    activeEvents,
    ticketsSold,
    grossRevenue,
    upcomingEvents,
  };
};

export const recentSaleService = async (userId: string) => {
  const sales = await recentSaleDao(userId);
  return sales.map((sale) => ({
    bookingRef: sale.bookingRef,
    customerName: sale.user.fullName,
    amount: sale.totalAmount.toNumber(),
    createdAt: sale.createdAt,
  }));
};

export const revenueService = async () => {
  const [totalTicketsSold, grossRevenue, recentPayment] = await Promise.all([
    totalTicketsSoldDao(),
    totalRevenueDao(),
    recentPaymentDao(),
  ]);

  const platformCommission = grossRevenue.div(10);

  return {
    totalTicketsSold,
    grossRevenue,
    platformCommission,
    recentPayment,
  };
};
