const { Router } = require("express");
const {
  getAllCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
} = require("../Controllers/courseController");
const { verifyJWT, authorizeRoles } = require("../middlewares/authMiddleware");

const router = Router();

//Public Routes
router.route("/allcourses").get(getAllCourses);
router.route("/getcourse/:id").get(getCourse);

//Protected routes
router
  .route("/create")
  .post(verifyJWT, authorizeRoles("SUPERADMIN"), createCourse);
router
  .route("/update/:id")
  .post(verifyJWT, authorizeRoles("SUPERADMIN"), updateCourse);
router
  .route("/delete/:id")
  .post(verifyJWT, authorizeRoles("SUPERADMIN"), deleteCourse);

module.exports = router;
