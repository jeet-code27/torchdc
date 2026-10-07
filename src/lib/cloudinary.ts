import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface UploadResult {
  url: string;
  publicId: string;
}

/**
 * Upload an image buffer or base64 data to Cloudinary
 */
export async function uploadToCloudinary(
  fileBase64: string,
  folder = "torch/categories"
): Promise<UploadResult> {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
    throw new Error("Cloudinary credentials are not configured in .env");
  }

  const result = await cloudinary.uploader.upload(fileBase64, {
    folder,
    resource_type: "image",
    transformation: [
      { quality: "auto:best" },
      { fetch_format: "auto" },
    ],
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}

/**
 * Delete an image from Cloudinary by its publicId
 */
export async function deleteFromCloudinary(publicId?: string): Promise<boolean> {
  if (!publicId) return true;

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
    console.warn("Skipping Cloudinary deletion: credentials not configured");
    return false;
  }

  try {
    const res = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
      invalidate: true,
    });
    console.log(`Cloudinary image deleted [${publicId}]:`, res.result);
    return res.result === "ok";
  } catch (error) {
    console.error(`Failed to delete image [${publicId}] from Cloudinary:`, error);
    return false;
  }
}

export { cloudinary };
