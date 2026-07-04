
import QRCode from 'qrcode';

export const generateQRBuffer = async (
  ticketCode: string,
) => {
  return QRCode.toBuffer(ticketCode);
};