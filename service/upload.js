const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  folder: "app",
  allowedFormats: ["jpeg", "jpg", "png"],
  transformation: [
    { gravity: "face", width: 400, height: 400, crop: "crop" },
    { radius: "max" },
    { width: 200, crop: "scale" },
    { fetch_format: "auto" },
  ],
});

cloudinary.image("*", {
  transformation: [
    { gravity: "face", height: 300, width: 300, crop: "fill" },
    { fetch_format: "png" },
    { radius: "max" },
  ],
});

const upload = multer({ storage: storage });
// console.log("upload", storage);

module.exports = upload;
