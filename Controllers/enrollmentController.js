const asyncHandler = require("express-async-handler");
const prisma = require("../prisma/index");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const sendEmail = require("../Services/emailService");

//Enrolled to Course
const enrollToCourse = asyncHandler(async (req, res) => {
  const courseId = parseInt(req.params.id);
  // const userAvailable=req.user

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

  // Fetch the course name and description
  const courseDetails = {
    name: course.title,
    description: course.description,
  };

  //Send Email
  const Subject = "Enrollment Successful!!";
  const HtmlContent = `Dear <strong> ${req.user.name}</strong>,<br> You have been successfully enrolled to our ${course.title} course. Feel free to reach to us for further enquiry!!<br>Happy learning buddy✌🏻`;
  const Recipient = req.user.email;

  sendEmail(Subject, HtmlContent, Recipient)
    .then(() => console.log("Course enrollment email sent successfully"))
    .catch((err) => console.error("Error sending email:", err));

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { ...newEnrollment, course: courseDetails, userName: req.user.name },
        "Enrollment successful."
      )
    );
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
      course: {
        include: {
          category: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  const totalCourses = enrolledCourses.length;
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        enrolledCourses,
        `Enrolled ${totalCourses} courses fetched successfully.`
      )
    );
});

module.exports = { enrollToCourse, getEnrolledCourses };
