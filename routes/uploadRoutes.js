const express = require("express");
const router = express.Router();
const uploadCtrl = require("../controllers/uploadController");
const { verifyToken, isAdminOrTeacher } = require("../middleware/authMiddleware");

// Upload routes (protected)
router.post("/pdf", verifyToken, isAdminOrTeacher, uploadCtrl.uploadPDF);
router.post("/image", verifyToken, isAdminOrTeacher, uploadCtrl.uploadImage);
router.post("/audio", verifyToken, isAdminOrTeacher, uploadCtrl.uploadAudio);

module.exports = router;



