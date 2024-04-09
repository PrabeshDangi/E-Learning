const { Router } = require("express");
const {
  enrollToCourse,
  getEnrolledCourses,
} = require("../Controllers/enrollmentController");
const { verifyJWT } = require("../middlewares/authMiddleware");
const router = Router();

//Private Routes
router.route("/getenrolled/:id").post(verifyJWT, enrollToCourse);
router.route("/getcourse").post(verifyJWT, getEnrolledCourses);

module.exports = router;
