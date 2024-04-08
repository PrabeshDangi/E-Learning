const { Router } = require("express");
const {
  enrollToCourse,
  getEnrolledCourses,
  deleteEnroll,
} = require("../Controllers/enrollmentController");
const { verifyJWT } = require("../middlewares/authMiddleware");
const router = Router();

//router.route("/delete/:id").post(deleteEnroll);
//Private Routes
router.route("/getenrolled/:id").post(verifyJWT, enrollToCourse);
router.route("/getcourse").post(verifyJWT, getEnrolledCourses);

module.exports = router;
