declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: string;
      permissions?: string[];
      validatedQuery?: unknown;
    }
  }
}

export {};
