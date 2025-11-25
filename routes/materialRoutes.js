const express = require("express");
const router = express.Router();
const { verifyToken, isStudent } = require('../middleware/authMiddleware');
const materialController = require("../controllers/materialController");

// GET /material?category=reading
router.get("/", verifyToken, isStudent, materialController.getMaterialsByCategory);

module.exports = router;
