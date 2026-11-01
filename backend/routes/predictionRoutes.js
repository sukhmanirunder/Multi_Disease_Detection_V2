const express = require("express");
const router = express.Router();

const {
  savePrediction,
  getPredictions,
  getPredictionById,
  screenPrediction,
} = require("../controllers/predictionController");

const protect = require("../middleware/authMiddleware");

// ⚠️ Specific routes MUST come before /:id

router.post("/screen", protect, screenPrediction);
router.get("/history", protect, getPredictions);   // alias for Dashboard

router.post("/", protect, savePrediction);
router.get("/", protect, getPredictions);
router.get("/:id", protect, getPredictionById);    // MUST be last

module.exports = router;