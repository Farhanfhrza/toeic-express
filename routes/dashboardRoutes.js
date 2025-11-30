const express = require("express");
const router = express.Router();
const { verifyToken, isStudent } = require("../middleware/authMiddleware");
const dashboardController = require("../controllers/dashboardController");

// GET /api/dashboard - Get student dashboard data
router.get("/", verifyToken, isStudent, dashboardController.getStudentDashboard);

module.exports = router;



