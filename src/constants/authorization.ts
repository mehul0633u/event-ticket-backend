export const ROLES = {
  USER: "user",
  ORGANIZER: "organizer",
  ADMIN: "admin",
} as const;

export type RoleTitle = (typeof ROLES)[keyof typeof ROLES];

export const PERMISSIONS = {
  // ─── Bookings ───────────────────────────────────────────────────────────────
  BOOKINGS_CREATE: "bookings:create",
  BOOKINGS_READ_OWN: "bookings:read-own",
  BOOKINGS_CANCEL_OWN: "bookings:cancel-own",
  BOOKING_READ_EVENT: "booking:read-event",
  BOOKINGS_READ_ALL: "bookings:read-all", // [NEW] admin views all bookings across events

  // ─── Tickets ────────────────────────────────────────────────────────────────
  TICKETS_DOWNLOAD_OWN: "tickets:download-own",
  TICKETS_CHECK_IN_OWN: "tickets:check-in-own", // organizer scans QR at their own event
  TICKETS_READ_OWN: "tickets:read-own", // [NEW] user reads own ticket details (e.g. ticket detail page)

  // ─── Profile ────────────────────────────────────────────────────────────────
  PROFILE_READ_OWN: "profile:read-own", // [NEW] user reads own profile (GET /me)
  PROFILE_UPDATE_OWN: "profile:update-own",

  // ─── Events ─────────────────────────────────────────────────────────────────
  EVENTS_CREATE: "events:create",
  EVENTS_READ_OWN: "events:read-own",
  EVENTS_UPDATE_OWN: "events:update-own",
  EVENTS_CANCEL_OWN: "events:cancel-own",
  EVENTS_SUBMIT_OWN: "events:submit-own", // [NEW] organizer submits draft event for admin review
  EVENTS_REVIEW: "events:review", // admin approves or rejects events
  EVENTS_READ_ALL: "events:read-all", // [NEW] admin reads all events regardless of status (approval queue)
  EVENTS_CANCEL: "events:cancel", // [NEW] admin can cancel any event (not just own)

  // ─── Event categories ───────────────────────────────────────────────────────
  EVENT_CATEGORIES_CREATE: "event-categories:create",
  EVENT_CATEGORIES_READ: "event-categories:read", // [NEW] reading categories is public but useful as explicit permission for admin UI

  // ─── Ticket tiers ───────────────────────────────────────────────────────────
  TICKET_TIERS_MANAGE_OWN: "ticket-tiers:manage-own", // organizer create/update/deactivate their own tiers

  // ─── Organizer dashboard ────────────────────────────────────────────────────
  DASHBOARD_READ_OWN: "dashboard:read-own",
  ATTENDEES_READ_OWN: "attendees:read-own",

  // ─── Payments & refunds ─────────────────────────────────────────────────────
  PAYMENTS_READ_OWN: "payments:read-own", // [NEW] user reads own payment records (receipts, history)
  REFUNDS_CREATE_OWN: "refunds:create-own", // [NEW] user requests a refund on their own booking
  REFUNDS_READ_OWN: "refunds:read-own", // [NEW] user checks status of their own refund request
  REFUNDS_READ_ALL: "refunds:read-all", // [NEW] admin reads all pending refund requests
  REFUNDS_MANAGE: "refunds:manage", // admin approves or rejects refunds

  // ─── Users (admin) ──────────────────────────────────────────────────────────
  USERS_READ: "users:read",
  USERS_UPDATE_STATUS: "users:update-status",
  USERS_UPDATE_ROLE: "users:update-role",

  // ─── Revenue (admin) ────────────────────────────────────────────────────────
  REVENUE_READ: "revenue:read",

  // ─── Venues ─────────────────────────────────────────────────────────────────
  VENUES_READ: "venues:read",
  VENUES_CREATE: "venues:create",
  VENUES_UPDATE_OWN: "venues:update-own",
  VENUES_DELETE_OWN: "venues:delete-own",
  VENUES_UPDATE: "venues:update", // admin updates any venue
  VENUES_DELETE: "venues:delete", // admin deletes any venue
} as const;

export type PermissionTitle = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// ─── Role → Permission mapping ───────────────────────────────────────────────
//
// Inheritance chain: admin ⊃ organizer ⊃ user
// Organizer gets all user permissions + organizer-specific ones.
// Admin gets all organizer permissions + admin-specific ones.

const userPermissions = [
  PERMISSIONS.BOOKINGS_CREATE,
  PERMISSIONS.BOOKINGS_READ_OWN,
  PERMISSIONS.BOOKINGS_CANCEL_OWN,
  PERMISSIONS.TICKETS_DOWNLOAD_OWN,
  PERMISSIONS.TICKETS_READ_OWN, // [NEW]
  PERMISSIONS.PROFILE_READ_OWN, // [NEW]
  PERMISSIONS.PROFILE_UPDATE_OWN,
  PERMISSIONS.PAYMENTS_READ_OWN, // [NEW]
  PERMISSIONS.REFUNDS_CREATE_OWN, // [NEW]
  PERMISSIONS.REFUNDS_READ_OWN, // [NEW]
  PERMISSIONS.EVENT_CATEGORIES_READ, // [NEW] needed to populate filter dropdowns
] as const;

const organizerPermissions = [
  PERMISSIONS.BOOKING_READ_EVENT,
  PERMISSIONS.EVENTS_CREATE,
  PERMISSIONS.EVENTS_UPDATE_OWN,
  PERMISSIONS.EVENTS_CANCEL_OWN,
  PERMISSIONS.EVENTS_SUBMIT_OWN, // [NEW]
  PERMISSIONS.TICKET_TIERS_MANAGE_OWN,
  PERMISSIONS.DASHBOARD_READ_OWN,
  PERMISSIONS.ATTENDEES_READ_OWN,
  PERMISSIONS.TICKETS_CHECK_IN_OWN,
  PERMISSIONS.VENUES_READ,
  PERMISSIONS.VENUES_CREATE,
  PERMISSIONS.VENUES_UPDATE_OWN,
  PERMISSIONS.VENUES_DELETE_OWN,
] as const;

const adminPermissions = [
  PERMISSIONS.EVENT_CATEGORIES_CREATE,
  PERMISSIONS.EVENTS_REVIEW,
  PERMISSIONS.EVENTS_READ_ALL, // [NEW]
  PERMISSIONS.EVENTS_CANCEL, // [NEW]
  PERMISSIONS.BOOKINGS_READ_ALL, // [NEW]
  PERMISSIONS.REFUNDS_READ_ALL, // [NEW]
  PERMISSIONS.REFUNDS_MANAGE,
  PERMISSIONS.USERS_READ,
  PERMISSIONS.USERS_UPDATE_STATUS,
  PERMISSIONS.USERS_UPDATE_ROLE,
  PERMISSIONS.REVENUE_READ,
  PERMISSIONS.VENUES_UPDATE,
  PERMISSIONS.VENUES_DELETE,
] as const;

export const ROLE_PERMISSIONS = {
  [ROLES.USER]: userPermissions,
  [ROLES.ORGANIZER]: [...userPermissions, ...organizerPermissions],
  [ROLES.ADMIN]: [
    ...userPermissions,
    ...organizerPermissions,
    ...adminPermissions,
  ],
} satisfies Record<RoleTitle, readonly PermissionTitle[]>;
