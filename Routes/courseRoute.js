const { Router } = require("express");
const {
  getAllCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
} = require("../Controllers/courseController");
const router = Router();

/************TODO: ROLE BASED AUTH******* */

//Public Routes
router.route("/allcourses").get(getAllCourses);
router.route("/getcourse/:id").get(getCourse);

//Protected routes
router.route("/create").post(createCourse);
router.route("/update/:id").post(updateCourse);
router.route("/delete/:id").post(deleteCourse);

module.exports = router;
