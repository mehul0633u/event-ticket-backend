
import PDFDocument from "pdfkit";
import axios from "axios";

interface GenerateTicketPdfInput {
  ticketCode: string;
  bookingRef: string;
  eventTitle: string;
  userName: string;
  venue: string;
  eventDate: string;
  qrCodeUrl: string;
}

export const generateTicketPdf = async ({
  ticketCode,
  bookingRef,
  eventTitle,
  userName,
  venue,
  eventDate,
  qrCodeUrl,
}: GenerateTicketPdfInput): Promise<Buffer> => {
  const doc = new PDFDocument({
    margin: 50,
  });

  const chunks: Buffer[] = [];

  doc.on("data", (chunk) => {
    chunks.push(chunk);
  });

  const qrResponse = await axios.get(qrCodeUrl, {
    responseType: "arraybuffer",
  });

  const qrBuffer = Buffer.from(qrResponse.data);

  doc.fontSize(24);
  doc.text(eventTitle, {
    align: "center",
  });

  doc.moveDown();

  doc.fontSize(14);
  doc.text(`Ticket Code: ${ticketCode}`);
  doc.text(`Booking Ref: ${bookingRef}`);
  doc.text(`Name: ${userName}`);
  doc.text(`Venue: ${venue}`);
  doc.text(`Date: ${eventDate}`);

  doc.moveDown(2);

  doc.image(qrBuffer, {
    fit: [200, 200],
    align: "center",
  });

  doc.end();

  return await new Promise((resolve) => {
    doc.on("end", () => {
      resolve(Buffer.concat(chunks));
    });
  });
};