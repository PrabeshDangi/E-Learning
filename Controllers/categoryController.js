const asyncHandler = require("express-async-handler");
const prisma = require("../prisma/index");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

// create a new category
const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;

  const categoryAvailable = await prisma.category.findUnique({
    where: {
      name: name,
    },
  });
  if (categoryAvailable) {
    throw new ApiError(400, "Category already exists!!");
  }

  // if (!name) {
  //   throw new ApiError(400, "Please provide the category name!!");
  // }

  const newCategory = await prisma.category.create({
    data: {
      name,
    },
  });

  res
    .status(201)
    .json(new ApiResponse(201, { category: newCategory }, "Category added!!"));
});

//  get all categories
const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await prisma.category.findMany();

  // Category sangai accociated course fetch garna ko lagi!!
  //  const categoriesWithCourses = await prisma.category.findMany({
  //   include: {
  //     courses: true,
  //   },
  // });

  if (!categories || categories.length === 0) {
    throw new ApiError(404, "No category found!!");
  }
  res
    .status(200)
    .json(new ApiResponse(200, { categories }, "Categories fetched"));
});

// Get category by ID
const getCategoryById = asyncHandler(async (req, res) => {
  const categoryId = parseInt(req.params.id);

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: {
      courses: true,
    },
  });

  if (!category) {
    throw new ApiError(400, "Category not found!!");
  } else {
    res
      .status(200)
      .json(new ApiResponse(200, { category }, "Category Fetched!!"));
  }
});

// Update category
const updateCategory = asyncHandler(async (req, res) => {
  const categoryId = parseInt(req.params.id);
  const { name } = req.body;

  const updatedCategory = await prisma.category.update({
    where: { id: categoryId },
    data: { name },
  });

  res
    .status(200)
    .json(new ApiResponse(200, { updatedCategory }, "Category Updated!!"));
});

//  delete category
const deleteCategory = asyncHandler(async (req, res) => {
  const categoryId = parseInt(req.params.id);
  await prisma.category.delete({
    where: { id: categoryId },
  });

  res.status(204).send();
});

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
