//extract publicId of Asset stored on cloudinary so that it can be overwritten while updating profile Image.
function extractPublicId(cloudinaryUrl) {
  // Check if the URL is valid
  if (!cloudinaryUrl.startsWith("http://res.cloudinary.com/")) {
    return null;
  }

  const parts = cloudinaryUrl.split("/");

  const uploadIndex = parts.indexOf("upload");

  // If "upload" is not found or if it's the last part of the URL, return null
  if (uploadIndex === -1 || uploadIndex === parts.length - 1) {
    return null;
  }

  // The public_id is the part after "upload"
  const publicIdWithExtension = parts[uploadIndex + 2];

  return publicIdWithExtension.split(".")[0];
}

module.exports = extractPublicId;
