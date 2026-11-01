const Prediction = require("../models/Prediction");
const mongoose = require("mongoose");
const axios = require("axios");

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";


// =========================================================
// SAVE PREDICTION (manual — used by other endpoints if needed)
// =========================================================

const savePrediction = async (req, res) => {
  try {
    const {
      disease,
      symptoms,
      inputData,
      prediction,
      probability,
      riskLevel,
      modelName,
      modelVersion,
      mode,
    } = req.body;

    const userId = req.user.userId;

    if (
      !disease ||
      prediction === undefined ||
      probability === undefined ||
      !riskLevel ||
      !modelName ||
      !modelVersion
    ) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing.",
      });
    }

    const newPrediction = await Prediction.create({
      userId,
      disease,
      mode: mode || "basic",
      symptoms: symptoms || "",
      inputData,
      prediction,
      probability,
      riskLevel,
      modelName,
      modelVersion,
    });

    return res.status(201).json({
      success: true,
      message: "Prediction saved successfully.",
      data: newPrediction,
    });
  } catch (error) {
    console.error("Prediction Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


// =========================================================
// GET ALL PREDICTIONS FOR THE USER (also used as /history)
// =========================================================

const getPredictions = async (req, res) => {
  try {
    const userId = req.user.userId;

    const history = await Prediction.find({ userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: history.length,
      message: "Prediction history fetched successfully.",
      data: history,
    });
  } catch (error) {
    console.error("Prediction Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


// =========================================================
// GET SINGLE PREDICTION
// =========================================================

const getPredictionById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid prediction id.",
      });
    }

    const prediction = await Prediction.findOne({ _id: id, userId });

    if (!prediction) {
      return res.status(404).json({
        success: false,
        message: "Prediction not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Prediction fetched successfully.",
      data: prediction,
    });
  } catch (error) {
    console.error("Prediction Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


// =========================================================
// SCREEN PREDICTION — proxies the adaptive screening flow
// to the FastAPI ML service
// =========================================================

const screenPrediction = async (req, res) => {
  try {
    const { session_id, message, feature_value, mode } = req.body;

    const response = await axios.post(
      `${ML_SERVICE_URL}/screen`,
      { session_id, message, feature_value, mode },
      { timeout: 30000 }
    );

    const data = response.data;

    // ✅ When screening completes, save the result to MongoDB
    if (data.status === "complete" && req.user) {
      try {
        const r = data.result;

        // Extract symptoms from the ORIGINAL first message only
        // (subsequent turns only send feature_value)
        const symptomsArray = message
          ? [message]   // first turn — save as single-element array
          : [];         // later turns — no new text to add

        await Prediction.create({
          userId: req.user.userId,
          disease: data.disease,
          mode: data.mode || "basic",
          symptoms: symptomsArray,           // ← array of strings
          inputData: {
            session_id: data.session_id,
            mode: data.mode,
          },
          prediction: Number(r.prediction),  // ← Number, not String
          probability: r.probability,
          riskLevel: r.riskLevel,            // ← "Low" / "Moderate" / "High"
          modelName: r.modelName,
          modelVersion: r.modelVersion,
        });

        console.log("✅ Prediction saved:", data.disease, r.riskLevel);
      } catch (dbErr) {
        console.error("HISTORY SAVE ERROR:", dbErr.message);
        // don't fail the request if history save fails
      }
    }

    return res.json(data);
  } catch (error) {
    console.error("ML SERVICE ERROR:", error.message);

    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }

    return res.status(500).json({
      detail: "ML service unavailable. Please try again.",
    });
  }
};

module.exports = {
  savePrediction,
  getPredictions,
  getPredictionById,
  screenPrediction,
};