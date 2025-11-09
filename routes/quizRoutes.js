const express = require('express');
const router = express.Router();
const { getAllQuizzes, getQuizDetail } = require('../controllers/quizController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, getAllQuizzes);
router.get('/:id', verifyToken, getQuizDetail);

module.exports = router;
