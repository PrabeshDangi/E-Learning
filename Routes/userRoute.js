const { Router } = require("express");
const upload = require("../middlewares/multer");
const router = Router();
const {
  registerUser,
  logInUser,
  logOutUser,
  updateUserDetails,
  updateImage,
  getProfileDetails,
  forgotPassword,
  resetPassword,
} = require("../Controllers/userController");
const { verifyJWT } = require("../middlewares/authMiddleware");

//Public Routes
router.route("/signup").post(upload.single("picture"), registerUser);
router.route("/login").post(logInUser);
router.route("/logout").post(logOutUser);
router.route("/forgotpassword").post(forgotPassword);
router.route("/resetpassword").post(resetPassword);

//Private Routes
router.route("/displayinfo").get(verifyJWT, getProfileDetails);
router.route("/updateinfo").post(verifyJWT, updateUserDetails);
router
  .route("/updateimage")
  .post(verifyJWT, upload.single("picture"), updateImage);

module.exports = router;
