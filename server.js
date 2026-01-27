require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Route test
app.get("/", (req, res) => {
  res.send("API Sulky Manager OK");
});

// ===== MongoDB =====
console.log("🔍 MONGO_URI =", process.env.MONGO_URI);

mongoose.set("strictQuery", false);

mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000, // timeout clair
  })
  .then(() => {
    console.log("✅ MongoDB connecté avec succès");
  })
  .catch((err) => {
    console.error("❌ Erreur MongoDB :", err);
  });

// Logs bas niveau (TRÈS UTILE)
mongoose.connection.on("connected", () => {
  console.log("🟢 Mongoose connection OPEN");
});

mongoose.connection.on("error", (err) => {
  console.error("🔴 Mongoose connection ERROR :", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("🟡 Mongoose connection DISCONNECTED");
});

// ===== Server =
