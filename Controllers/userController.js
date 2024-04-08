const asyncHandler = require("express-async-handler");
const prisma = require("../prisma/index");
const bcrypt = require("bcrypt");
const {
  cloudinaryFileUpload,
  cloudinaryFileDelete,
} = require("../utils/cloudinaryFileUpload");
const validateAuth = require("../helper/authValidator");
const extractPublicId = require("../helper/extractPublicId");

const sendtoken = require("../utils/sendAuthToken");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const sendEmail = require("../Services/emailService");
const { v4: uuidv4 } = require("uuid");

//Register User
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // Validate user input against the auth schema
  const { error, value } = validateAuth(req.body);

  if (error) {
    throw new ApiError(400, error.details[0].message);
  }

  if ([name, email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All the fields are required!!");
  }

  const availableuser = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (availableuser) {
    throw new ApiError(400, "User already exists!!");
  }

  const pictureLocalPath = req.file?.path;
  //console.log(req.file);

  if (!pictureLocalPath) {
    throw new ApiError(400, "Profile Image not available!!");
  }

  const ProfileImage = await cloudinaryFileUpload(pictureLocalPath);

  if (!ProfileImage.url) {
    throw new ApiError(400, "Profile-Image uploading failed!!");
  }

  const encryptedPw = await bcrypt.hash(password, 10);

  const newuser = await prisma.user.create({
    data: {
      name: name,
      email: email,
      password: encryptedPw,
      picture: ProfileImage.url,
      role,
    },
  });

  const createdUser = await prisma.user.findUnique({
    where: {
      id: newuser.id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      picture: true,
      role: true,
    },
  });

  //Email Service
  const Subject = "Registration Successful!!";
  const HtmlContent = `Dear <strong> ${name}</strong><br> You have been registered to our E-learning platform.Thank you for joining us!`;
  const Recipient = email;

  sendEmail(Subject, HtmlContent, Recipient)
    .then(() => console.log("Registration emails sent successfully"))
    .catch((err) => console.error("Error sending registration emails:", err));

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User Registered Successfully!!"));
});

//Login User
const logInUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, "Please provide the email and password!");
  }

  const userAvailable = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (!userAvailable) {
    throw new ApiError(400, "Provide valid email and password.");
  }

  const isValidPW = await bcrypt.compare(password, userAvailable.password);

  if (!isValidPW) {
    throw new ApiError(400, "Invalid password!!");
  }
  //console.log(userAvailable);
  sendtoken(userAvailable, 200, res);
});

//Logout User
const logOutUser = asyncHandler(async (_, res) => {
  try {
    res.clearCookie("token");

    return res.status(200).json({
      message: "User logged out successfully!!",
    });
  } catch (error) {
    throw new ApiError(400, "Invalid Attempt!!");
  }
});

//Get own Profile details by the loggedin user
const getProfileDetails = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new ApiError(
      400,
      "Cannot retrieve information of user who is not logged in!!"
    );
  }

  const userInfo = await prisma.user.findUnique({
    where: {
      id: req.user?.id,
    },
    select: {
      name: true,
      email: true,
      picture: true,
      role: true,
    },
  });

  if (!userInfo) {
    throw new ApiError(404, "User not found!!");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { userInfo },
        "User Information retrieved successfully!!"
      )
    );
});

//Update user info by logged in user
const updateUserDetails = asyncHandler(async (req, res) => {
  const { email, name } = req.body;

  if ([email, name].some((fields) => fields?.trim() === "")) {
    throw new ApiError(400, "Enter all the details!!");
  }

  await prisma.user.update({
    where: {
      id: req.user?.id,
    },
    data: { email, name },
  });

  const updatedInfo = await prisma.user.findUnique({
    where: {
      id: req.user?.id,
    },
    select: {
      email: true,
      name: true,
    },
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { updatedInfo },
        "User details uptaded successfully!!"
      )
    );
});

const updateImage = asyncHandler(async (req, res) => {
  const newImage = req.file?.path;

  if (!newImage) {
    throw new ApiError(400, "Please upload the new Photo!!");
  }

  const user = req.user;
  //console.log(user);
  const oldImageUrl = user.picture;

  //extract public_id as:
  const public_id = await extractPublicId(oldImageUrl);

  const newProfileImage = await cloudinaryFileUpload(newImage);
  console.log(newProfileImage.url);

  const updatedInfo = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      picture: newProfileImage.url,
    },
    select: {
      name: true,
      picture: true,
    },
  });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { updatedInfo },
        "Profile image uptaded successfully!!"
      )
    );
  await cloudinaryFileDelete(public_id);
});

//***************TODO:DELETE THIS */
//Delete User
const deleteuser = async (req, res) => {
  const userId = parseInt(req.params.id);
  if (!userId) {
    res.status(404).json({
      message: "User not available",
    });
  }
  await prisma.user.delete({
    where: {
      id: userId,
    },
  });
  res.status(200).json({
    message: "User deleted successfully!",
  });
};

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const userAvailable = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!userAvailable) {
    throw new ApiError(404, "User not found!!");
  }

  //Generate reset Token
  const resetToken = uuidv4();
  const resetTokenExpiration = new Date(Date.now() + 600000); //For 10 minutes

  await prisma.passwordReset.create({
    data: {
      userId: userAvailable.id,
      token: resetToken,
      expiresAt: resetTokenExpiration,
    },
  });

  //Email service
  const Subject = "Password Reset Request";
  const HtmlContent = `<strong>CONFIDENTIAL!!</strong><br> Your password reset token is: ${resetToken}. <br>Warning: Do not share this token with anyone.`;
  const Recipient = email;

  sendEmail(Subject, HtmlContent, Recipient)
    .then(() => console.log("Password reset email sent successfully!!"))
    .catch((err) => console.error("Error sending registration emails:", err));

  res.status(200).json(new ApiResponse(200, {}, "Reset email sent!!"));
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token: resetToken, password } = req.body;

  if (!resetToken) {
    throw new ApiError(400, "Reset token is required");
  }

  const resetRecord = await prisma.passwordReset.findUnique({
    where: { token: resetToken },
  });

  if (!resetRecord || resetRecord.expiresAt < new Date()) {
    throw new ApiError(400, "Invalid or expired token!!");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id: resetRecord.userId },
    data: { password: hashedPassword },
  });

  await prisma.passwordReset.delete({ where: { token: resetToken } });

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Password reset successfully!!"));
});

module.exports = {
  registerUser,
  logInUser,
  logOutUser,
  updateUserDetails,
  updateImage,
  getProfileDetails,
  deleteuser,
  forgotPassword,
  resetPassword,
};
