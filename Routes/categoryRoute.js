const { Router } = require("express");
const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../Controllers/categoryController");
const { verifyJWT, authorizeRoles } = require("../middlewares/authMiddleware");
const router = Router();

//Public Routes
router.route("/getall").get(getAllCategories);
router.route("/get/:id").get(getCategoryById);

//private Routes
router
  .route("/create")
  .post(verifyJWT, authorizeRoles("SUPERADMIN"), createCategory);
router
  .route("/update/:id")
  .post(verifyJWT, authorizeRoles("SUPERADMIN"), updateCategory);
router
  .route("/delete/:id")
  .post(verifyJWT, authorizeRoles("SUPERADMIN"), deleteCategory);

module.exports = router;
