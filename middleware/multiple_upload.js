// middlewares/kycUpload.js

const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/kyc");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + ext);
  },
});

function fileFilter(req, file, cb) {
  const allowedImage = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

  if (allowedImage.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("❌ Only image files are allowed"), false);
  }
}

const kycUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = kycUpload;