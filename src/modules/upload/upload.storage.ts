import { CloudinaryStorage } from "multer-storage-cloudinary";
import { randomBytes } from "node:crypto";

import { cloudinary } from "../../config/cloudinary.js";

export const eventBannerStorage = new CloudinaryStorage({
  cloudinary,
  params: async () => ({
    folder: "event-banners",
    resource_type: "image",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    public_id: `event-banner-${Date.now()}-${randomBytes(4).toString("hex")}`,
  }),
});
