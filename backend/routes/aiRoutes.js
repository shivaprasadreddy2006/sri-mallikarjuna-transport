const express = require('express');
const router = express.Router();
const { interpretTeluguVoice } = require('../controllers/aiController');

router.post('/interpret', interpretTeluguVoice);

module.exports = router;
