const express = require("express");
const router = express.Router();
const { verifyToken, isStudent } = require('../middleware/authMiddleware');
const exerciseController = require("../controllers/exerciseController");

router.get("/attempt/:attemptId/questions",
    verifyToken,
    isStudent,
    exerciseController.getQuestionsByAttempt
);
router.get("/:materialId", verifyToken, isStudent, exerciseController.getExercisesByMaterial);
router.get("/question/:questionId", verifyToken, isStudent, exerciseController.getExerciseQuestion);

router.post("/start", verifyToken, isStudent, exerciseController.startExerciseAttempt);
router.post("/submit", verifyToken, isStudent, exerciseController.submitExerciseAnswer);
router.post("/finish", verifyToken, isStudent, exerciseController.finishExerciseAttempt);


router.get("/attempt/history/user", verifyToken, isStudent, exerciseController.getExerciseAttempts);

module.exports = router;
