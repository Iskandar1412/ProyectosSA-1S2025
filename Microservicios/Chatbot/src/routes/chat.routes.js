const express = require('express');
const { isAuthUser } = require('../middleware/auth.middleware');
const { chatFunction, obtenerChat } = require('../controllers/chat.controller');

const router = express.Router();

// GET
router.get('/chat', isAuthUser, obtenerChat)

// POST
router.post('/chat', isAuthUser, chatFunction)

module.exports = router