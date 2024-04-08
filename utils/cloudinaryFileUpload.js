const cloudinary = require("cloudinary").v2;
const fs = require("fs");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const cloudinaryFileUpload = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const uploadedFile = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "image",
    });

    console.log(`File uploaded successfully: ${uploadedFile.url}`);
    fs.unlinkSync(localFilePath);

    return uploadedFile;
  } catch (error) {
    console.log(error.message);
    fs.unlinkSync(localFilePath);
    return null;
  }
};

const cloudinaryFileDelete = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    await cloudinary.uploader.destroy(localFilePath);
  } catch (error) {
    return null;
  }
};

module.exports = {
  cloudinaryFileUpload,
  cloudinaryFileDelete,
};
