const express = require("express");
const router = express.Router();
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

const { getAllResults, exportResultsToExcel } = require("../controllers/adminResultsController");
const userCtrl = require("../controllers/admin/userController");

router.get("/results", getAllResults);
router.get("/results/export", exportResultsToExcel);

router.post("/users", verifyToken, userCtrl.createUser);
router.get("/users", userCtrl.getAllUsers);
router.put("/users/:id", userCtrl.updateUser);
router.delete("/users/:id", userCtrl.deleteUser);

module.exports = router;
