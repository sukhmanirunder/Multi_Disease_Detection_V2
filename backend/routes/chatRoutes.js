const express = require("express");
const router = express.Router();
const { handleChat } = require("../controllers/chatController");
const protect = require("../middleware/authMiddleware");

// POST /api/chat
router.post("/", protect, handleChat);

module.exports = router;