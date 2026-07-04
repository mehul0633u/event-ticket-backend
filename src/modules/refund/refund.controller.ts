import { Request, Response } from "express";
import {
  refundRequestService,
  refundPreviewService,
  refundApproveService,
  refundRejectService,
  getMyRefundService,
  getRefundService,
} from "./refund.service.js";
import { StatusCodes } from "http-status-codes";
import { MESSAGES } from "../../constants/constant.js";
import { sendSuccess } from "../../utils/apiResponse.js";

export const refundRequestController = async (req: Request, res: Response) => {
  const { bookingId, reason } = req.body;
  const userId = req.userId as string;

  const refund = await refundRequestService({
    bookingId,
    reason,
    userId,
  });

  sendSuccess(res, {
    statusCode: StatusCodes.OK,
    message: MESSAGES.REFUND.REFUND_REQUEST_CREATED,
    data: refund,
  });
};

export const refundPreviewController = async (req: Request, res: Response) => {
  const bookingId = req.query.bookingId as string;
  const userId = req.userId as string;

  const refund = await refundPreviewService({ bookingId, userId });

  sendSuccess(res, {
    statusCode: StatusCodes.OK,
    message: MESSAGES.REFUND.REFUND_PREVIEW_RETEIEVED,
    data: refund,
  });
};

export const refundApproveController = async (req: Request, res: Response) => {
  const { refundId } = req.body;
  const userId = req.userId as string;

  const refund = await refundApproveService({ refundId, userId });

  sendSuccess(res, {
    statusCode: StatusCodes.CREATED,
    message: MESSAGES.REFUND.REFUND_APPROVED,
    data: refund,
  });
};

export const refundRejectController = async (req: Request, res: Response) => {
  const { refundId, reason } = req.body;
  const userId = req.userId as string;

  const refund = await refundRejectService({ refundId, reason, userId });

  sendSuccess(res, {
    statusCode: StatusCodes.CREATED,
    message: MESSAGES.REFUND.REFUND_REJECTED,
    data: refund,
  });
};

export const getRefundController = async (req: Request, res: Response) => {
  const refunds = await getRefundService();

  sendSuccess(res, {
    statusCode: StatusCodes.OK,
    message: MESSAGES.REFUND.REFUND_RETRIEVED_SUCCESS,
    data: refunds,
  });
};

export const getMyRefundController = async (req: Request, res: Response) => {
  const userId = req.userId as string;

  const refunds = await getMyRefundService(userId);

  sendSuccess(res, {
    statusCode: StatusCodes.OK,
    message: MESSAGES.REFUND.REFUND_RETRIEVED_SUCCESS,
    data: refunds,
  });
};
