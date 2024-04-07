const { Router } = require("express");
const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../Controllers/categoryController");
const verifyJWT = require("../middlewares/authMiddleware");
const router = Router();

/************TODO: ROLE BASED AUTH******* */

//Public Routes
router.route("/getall").get(getAllCategories);

//private Routes
router.route("/get/:id").get(verifyJWT, getCategoryById);
router.route("/create").post(verifyJWT, createCategory);
router.route("/update/:id").post(verifyJWT, updateCategory);
router.route("/delete/:id").post(verifyJWT, deleteCategory);

module.exports = router;
