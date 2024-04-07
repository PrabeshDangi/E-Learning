const { Router } = require("express");
const {
  enrollToCourse,
  getEnrolledCourses,
} = require("../Controllers/enrollmentController");
const verifyJWT = require("../middlewares/authMiddleware");
const router = Router();

//Private Routes
router.route("/getenrolled").post(verifyJWT, enrollToCourse);
router.route("/getcourse").post(verifyJWT, getEnrolledCourses);

module.exports = router;
