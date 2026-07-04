import { Request, Response } from "express";
import {
  createPaymentService,
  verifyPaymentService,
} from "./payment.service.js";
import { StatusCodes } from "http-status-codes";
import { MESSAGES } from "../../constants/constant.js";
import { sendSuccess } from "../../utils/apiResponse.js";

export const createPaymentController = async (req: Request, res: Response) => {
  const { bookingId } = req.body;
  const userId = req.userId as string;

  const payment = await createPaymentService({ bookingId, userId });

  sendSuccess(res, {
    statusCode: StatusCodes.CREATED,
    message: MESSAGES.PAYMENT.PAYMENT_CREATED_SUCCESS,
    data: payment,
  });
};

export const verifyPaymentController = async (req: Request, res: Response) => {
  const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } =
    req.body;
  const userId = req.userId as string;

  const verify = await verifyPaymentService({
    userId,
    bookingId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  });

  sendSuccess(res, {
    statusCode: StatusCodes.OK,
    message: MESSAGES.PAYMENT.PAYMENT_VERIFY_SUCCESS,
    data: verify,
  });
};
