const express = require('express');
const router = express.Router();
const { submitQuiz, getLatestResult } = require('../controllers/resultController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/submit', verifyToken, submitQuiz);
router.get('/latest', verifyToken, getLatestResult);

module.exports = router;
