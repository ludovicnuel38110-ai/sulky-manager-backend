const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth"); // 🔴 IMPORTANT

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes); // 🔴 ICI le bug était

// Test route
app.get("/", (req, res) => {
  res.send("API Sulky Manager OK");
});

// DB
mongoose
  .connect("mongodb://127.0.0.1:27017/sulky_manager")
  .then(() => console.log("MongoDB connecté"))
  .catch(err => console.error(err));

// Server
app.listen(5000, () => {
  console.log("Serveur lancé sur le port 5000");
});
app.use("/api/player", require("./routes/player"));
const playerRoutes = require("./routes/player");

app.use("/api/player", playerRoutes);
