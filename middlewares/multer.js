const multer = require("multer");
const path = require("path");

let limit = {
  fileSize: 1024 * 1024 * 3,
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public");
  },
  filename: function (req, file, cb) {
    let filename = Date.now() + file.originalname;
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  let validExtensions = [
    ".jpeg",
    ".jpg",
    ".JPG",
    ".JPEG",
    ".png",
    ".svg",
    ".PNG",
  ];

  let originalname = file.originalname;
  let originalExtension = path.extname(originalname);
  let isValidExtension = validExtensions.includes(originalExtension);

  if (isValidExtension) {
    cb(null, true);
  } else {
    cb(new Error("File format not supported"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: limit,
});

module.exports = upload;
