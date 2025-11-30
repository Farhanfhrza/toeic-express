const express = require("express");
const router = express.Router();
const { verifyToken, isStudent } = require('../middleware/authMiddleware');
const materialController = require("../controllers/materialController");

// GET /material?category=reading
router.get("/", verifyToken, isStudent, materialController.getMaterialsByCategory);

// GET /material/:materialId - Get material detail dengan progress
router.get("/:materialId", verifyToken, isStudent, materialController.getMaterialDetail);

// POST /material/:materialId/start - Mark material as "sedang dipelajari"
router.post("/:materialId/start", verifyToken, isStudent, materialController.startMaterial);

// POST /material/:materialId/complete - Mark material as "selesai"
router.post("/:materialId/complete", verifyToken, isStudent, materialController.completeMaterial);

module.exports = router;
