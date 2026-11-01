const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const chatRoutes = require("./routes/chatRoutes");
const healthRoutes = require("./routes/healthRoutes");
const authRoutes=require("./routes/authRoutes")
const userRoutes = require("./routes/userRoutes");
const predictionRoutes = require("./routes/predictionRoutes");
const app = express();

// Middlewares
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// Routes
app.use("/api/health", healthRoutes);
app.use("/api/auth",authRoutes)
app.use("/api/users", userRoutes);
app.use("/api/predictions", predictionRoutes);

// ... inside your routes section:
app.use("/api/chat", chatRoutes);

// Home Route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "AI Multi Disease Backend Running 🚀"
    });
});

module.exports = app;