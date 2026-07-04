
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet(
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZ",
  10,
);

export const generateTicketCode = () => {
  return `TKT-${nanoid()}`;
};