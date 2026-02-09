import multer from "multer";
import sharp from "sharp";
import imagekit from "../utils/imagekit";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(new Error("Unsupported fiel format. Only JPG and PNG allowed"), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    // Sharp Processing (Sanitize + Compress + Strip Metadata)
    const processedBuffer = await sharp(req.file.buffer)
      .resize({ width: 1080, withoutEnlargement: true })
      .toFormat("jpeg", { quality: 80 })
      .withMetadata(false)
      .toBuffer();

    // upload to ImageKit
    const response = await imagekit.upload({
      file: processedBuffer,
      fileName: `baatcheet_${Date.now()}.jpg`,
      folder: "/baatcheet_images",
    });

    // return the URL
    res.status(200).json({
      success: true,
      imageUrl: response.url,
      thumbnailUrl: response.thumbnailUrl,
    });
  } catch (error) {
    console.error("Image upload error: ", error);
    res.status(500).json({ message: "Image upload failed" });
  }
};
