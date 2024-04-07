const asyncHandler = require("express-async-handler");
const prisma = require("../prisma/index");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");

//get all courses
const getAllCourses = asyncHandler(async (req, res) => {
  let page = Number(req.query.page) || 1;
  let limit = Number(req.query.limit) || 5;
  const skip = (page - 1) * limit;

  const filterOptions = {};

  if (req.query.category) {
    const categoryName =
      req.query.category.charAt(0).toUpperCase() +
      req.query.category.slice(1).toLowerCase();

    const category = await prisma.category.findUnique({
      where: {
        name: categoryName,
      },
    });

    if (!category) {
      throw new ApiError(404, "Category not found");
    }

    // For Filtering, we use category ID.
    filterOptions.categoryId = category.id;
  }

  if (req.query.level) {
    filterOptions.level = req.query.level.toUpperCase();
  }

  if (req.query.popularity) {
    filterOptions.popularity = req.query.popularity;
  }

  // By default sort courses by popularity in descending order
  let orderBy = {
    popularity: "desc",
  };

  //For explicit sorting
  if (req.query.sort && req.query.sort.toLowerCase() === "asc") {
    orderBy.popularity = "asc";
  }

  const allCourses = await prisma.course.findMany({
    skip: skip,
    take: limit,
    where: filterOptions,
    orderBy: orderBy,
    include: {
      category: true,
    },
  });

  if (!allCourses || allCourses.length === 0) {
    throw new ApiError(404, "No courses available with the provided filters!!");
  }

  const coursesWithCategoryName = allCourses.map((course) => ({
    ...course,
    categoryName: course.category.name,
    category: undefined,
  }));

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { allCourses: coursesWithCategoryName },
        "Courses fetched successfully with applied filters and sorting!!"
      )
    );
});

//get Course by id
const getCourse = asyncHandler(async (req, res) => {
  const courseId = parseInt(req.params.id);
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    include: {
      category: true,
    },
  });

  if (!course) {
    throw new ApiError(404, "Course not available!!");
  }

  // Extract the category name from the course data
  const categoryName = course.category ? course.category.name : "Uncategorized";

  const responseData = {
    ...course,
    categoryName: categoryName,
    category: undefined,
  };

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { course: responseData },
        "Course fetched successfully!!"
      )
    );
});

//Create course
const createCourse = asyncHandler(async (req, res) => {
  const { title, description, level, popularity, category } = req.body;

  if (!title || !description || !level || !popularity || !category) {
    throw new ApiError(400, "All the fields are required!!");
  }

  const categoryInfo = await prisma.category.findUnique({
    where: {
      name: category,
    },
  });

  if (!categoryInfo) {
    throw new ApiError(400, "Invalid category specified");
  }

  const categoryId = categoryInfo.id;

  const courseAvailable = await prisma.course.findFirst({
    where: {
      title: title,
      categoryId: categoryId,
    },
  });

  if (courseAvailable) {
    throw new ApiError(400, "Course already registered!!");
  }

  const newCourse = await prisma.course.create({
    data: {
      title: title,
      description: description,
      level: level,
      popularity: popularity,
      category: {
        connect: {
          id: categoryId,
        },
      },
    },
  });

  return res
    .status(201)
    .json(new ApiResponse(201, { newCourse }, "New Course added!!"));
});

//Update course
const updateCourse = asyncHandler(async (req, res) => {
  const { description, popularity, title, level, category } = req.body;

  if (!description && !popularity && !title && !level && !category) {
    throw new ApiError(400, "Please provide at least one field to update.");
  }

  const courseId = parseInt(req.params.id);

  if (!courseId) {
    throw new ApiError(404, "Course not found!!");
  }

  // Handle update only for provided fields otherwise, set original values
  const updateData = {};
  if (description) updateData.description = description;
  if (popularity) updateData.popularity = popularity;
  if (title) updateData.title = title;
  if (level) updateData.level = level;

  let categoryId;
  if (category) {
    const foundCategory = await prisma.category.findUnique({
      where: {
        name: category,
      },
    });

    if (!foundCategory) {
      throw new ApiError(404, "Category not found!!");
    }

    categoryId = foundCategory.id;
    updateData.categoryId = parseInt(categoryId);
  }

  const updatedCourse = await prisma.course.update({
    where: {
      id: courseId,
    },
    data: updateData,
  });

  // Update the category table if category of course has been updated
  if (category && updatedCourse.categoryId !== categoryId) {
    await prisma.category.update({
      where: {
        id: updatedCourse.categoryId,
      },
      data: {
        courses: {
          disconnect: { id: courseId },
        },
      },
    });

    await prisma.category.update({
      where: {
        id: categoryId,
      },
      data: {
        courses: {
          connect: { id: courseId },
        },
      },
    });
  }

  res
    .status(200)
    .json(new ApiResponse(200, updatedCourse, "Course updated successfully."));
});

//Delete Course
const deleteCourse = asyncHandler(async (req, res) => {
  const courseId = req.params.id;

  if (!courseId) {
    throw new ApiError(404, "Course not found!!");
  }

  await prisma.course.delete({
    where: {
      id: courseId,
    },
  });
  return res
    .status(202)
    .json(new ApiResponse(202, {}, "Course deleted successfully!!"));
});

module.exports = {
  getAllCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
};
