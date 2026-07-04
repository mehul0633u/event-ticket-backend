import { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } from "../config/env.js";
import Razorpay from "razorpay";

export const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

export const createRefund = async (paymentId: string, amount: number) => {
  return razorpay.payments.refund(paymentId, {
    amount: Math.round(amount * 100),
  });
};
