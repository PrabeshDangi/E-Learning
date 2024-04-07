const asyncHandler = require("express-async-handler");
const prisma = require("../prisma/index");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");

//Enrolled to Course
const enrollToCourse = asyncHandler(async (req, res) => {
  const courseId = parseInt(req.params.courseId);

  if (!courseId) {
    throw new ApiError(400, "Course ID is required.");
  }

  if (!req.user) {
    throw new ApiError(401, "User should be logged in to get enrollemnt.");
  }

  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
  });

  if (!course) {
    throw new ApiError(404, "Course not found.");
  }

  // Check if the user is already enrolled in the course
  const existingEnrollment = await prisma.enrollment.findFirst({
    where: {
      courseId: courseId,
      userId: req.user.id,
    },
  });

  if (existingEnrollment) {
    throw new ApiError(400, "User is already enrolled in this course.");
  }

  const newEnrollment = await prisma.enrollment.create({
    data: {
      courseId: courseId,
      userId: req.user.id,
    },
  });

  res
    .status(200)
    .json(new ApiResponse(200, newEnrollment, "Enrollment successful."));
});

//Get enrolled courses
const getEnrolledCourses = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized access!!");
  }

  const enrolledCourses = await prisma.enrollment.findMany({
    where: {
      userId: req.user.id,
    },
    include: {
      course: true,
    },
  });
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        enrolledCourses,
        "Enrolled courses fetched successfully."
      )
    );
});

module.exports = { enrollToCourse, getEnrolledCourses };
