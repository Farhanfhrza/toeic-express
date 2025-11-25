const express = require("express");
const router = express.Router();
const { getAllClasses } = require('../controllers/classController.js');

router.get('/', getAllClasses); 

module.exports = router;