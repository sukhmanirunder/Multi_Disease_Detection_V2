const express = require("express");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Protected user profile route
router.get("/profile", protect, (req, res) => {
    res.status(200).json({
        success: true,
        message: "Protected profile route accessed successfully",
        user: req.user
    });
});

module.exports = router;