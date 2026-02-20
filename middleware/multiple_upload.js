const multer = require("multer");
const path = require("path");

// Storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, "uploads/posts/images");
    } else if (file.mimetype.startsWith("video/")) {
      cb(null, "uploads/posts/videos");
    } else {
      cb(new Error("❌ Only images and videos are allowed"), false);
    }
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + ext);
  },
});

// File filter
function fileFilter(req, file, cb) {
  const allowedImage = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  const allowedVideo = ["video/mp4", "video/mov", "video/avi"];

  if (
    allowedImage.includes(file.mimetype) ||
    allowedVideo.includes(file.mimetype)
  ) {
    cb(null, true);
  } else {
    cb(new Error("❌ Unsupported file type"), false);
  }
}

const multiupload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
});

module.exports = multiupload;
