const express = require("express");
const router = express.Router();
const multer = require("multer");
const { verifyToken, isAdminOrTeacher } = require("../middleware/authMiddleware");

const { getAllResults, exportResultsToExcel } = require("../controllers/adminResultsController");
const userCtrl = require("../controllers/admin/userController");
const classCtrl = require("../controllers/admin/classController");
const materialCtrl = require("../controllers/admin/materialController");
const questionCtrl = require("../controllers/admin/questionController");

// Configure multer for file upload
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
            file.mimetype === "application/vnd.ms-excel" ||
            file.mimetype === "text/csv"
        ) {
            cb(null, true);
        } else {
            cb(new Error("Only Excel files are allowed"), false);
        }
    },
});

// Results
router.get("/results", getAllResults);
router.get("/results/export", exportResultsToExcel);

// Users CRUD
router.post("/users", verifyToken, isAdminOrTeacher, userCtrl.createUser);
router.post("/users/bulk", verifyToken, isAdminOrTeacher, upload.single("file"), userCtrl.bulkCreateUsers);
router.get("/users", verifyToken, isAdminOrTeacher, userCtrl.getAllUsers);
router.get("/users/:id", verifyToken, isAdminOrTeacher, userCtrl.getUserById);
router.get("/users/:id/detail", verifyToken, isAdminOrTeacher, userCtrl.getUserDetail);
router.put("/users/:id", verifyToken, isAdminOrTeacher, userCtrl.updateUser);
router.delete("/users/:id", verifyToken, isAdminOrTeacher, userCtrl.deleteUser);

// Classes CRUD
router.post("/classes", verifyToken, isAdminOrTeacher, classCtrl.createClass);
router.get("/classes", verifyToken, isAdminOrTeacher, classCtrl.getAllClasses);
router.get("/classes/:id", verifyToken, isAdminOrTeacher, classCtrl.getClassById);
router.put("/classes/:id", verifyToken, isAdminOrTeacher, classCtrl.updateClass);
router.delete("/classes/:id", verifyToken, isAdminOrTeacher, classCtrl.deleteClass);

// Materials CRUD
router.post("/materials", verifyToken, isAdminOrTeacher, materialCtrl.createMaterial);
router.get("/materials", verifyToken, isAdminOrTeacher, materialCtrl.getAllMaterials);
router.get("/materials/:id", verifyToken, isAdminOrTeacher, materialCtrl.getMaterialById);
router.put("/materials/:id", verifyToken, isAdminOrTeacher, materialCtrl.updateMaterial);
router.delete("/materials/:id", verifyToken, isAdminOrTeacher, materialCtrl.deleteMaterial);

// Questions CRUD
router.post("/questions", verifyToken, isAdminOrTeacher, questionCtrl.createQuestion);
router.get("/questions", verifyToken, isAdminOrTeacher, questionCtrl.getAllQuestions);
router.get("/questions/:id", verifyToken, isAdminOrTeacher, questionCtrl.getQuestionById);
router.put("/questions/:id", verifyToken, isAdminOrTeacher, questionCtrl.updateQuestion);
router.delete("/questions/:id", verifyToken, isAdminOrTeacher, questionCtrl.deleteQuestion);

module.exports = router;
