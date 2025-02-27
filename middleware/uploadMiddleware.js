const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// Cloudinary yapılandırması
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Dosya adını düzenle
function sanitizeFileName(fileName) {
  return fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9.]/g, "-")
    .replace(/\s+/g, "-")
    .toLowerCase();
}

// Cloudinary depolama ayarları
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "kurs",
    allowed_formats: ["jpg", "jpeg", "png", "gif"],
    transformation: [
      { width: 1000, height: 1000, crop: "limit" },
      { quality: "auto:good" },
    ],
    public_id: (req, file) => {
      const fileName = sanitizeFileName(file.originalname.split(".")[0]);
      return `${Date.now()}-${fileName}`;
    },
  },
});

// Dosya filtreleme
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif"];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Sadece JPG, PNG ve GIF formatları desteklenmektedir."),
      false
    );
  }
};

// Multer ayarları
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Hata yakalama middleware
const uploadMiddleware = (req, res, next) => {
  const uploadSingle = upload.single("image");

  uploadSingle(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "Dosya boyutu 5MB'dan büyük olamaz!",
        });
      }

      return res.status(400).json({
        success: false,
        message: err.message || "Dosya yüklenirken bir hata oluştu",
      });
    }
    next();
  });
};

module.exports = uploadMiddleware;
