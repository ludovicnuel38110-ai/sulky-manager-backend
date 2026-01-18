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

// MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connecté");
  })
  .catch((err) => {
    console.error("❌ Erreur MongoDB :", err.message);
  });

// Port Render
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur le port ${PORT}`);
});
