const mongoose = require("mongoose");

const predictionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    disease: {
      type: String,
      required: true,
    },
    mode: {
      type: String,
      enum: ["basic", "complete"],
      default: "basic",
    },
    symptoms: {
      type: [String],          // array of symptom keywords / user text
      default: [],
    },
    inputData: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    prediction: {
      type: Number,            // 0 or 1
      required: true,
    },
    probability: {
      type: Number,
      required: true,
    },
    riskLevel: {
      type: String,
      enum: ["Low", "Moderate", "High"],   // ← allow Moderate
      required: true,
    },
    modelName: {
      type: String,
      required: true,
    },
    modelVersion: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Completed", "Failed"],
      default: "Completed",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Prediction", predictionSchema);