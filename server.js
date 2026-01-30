require("dotenv").config();

const express = require("express");
const cors = require("cors");
require("./config/db");

const app = express();


/* ==================================================
   ✅ CORS FIX (IMPORTANT POUR RENDER + FRONTEND)
================================================== */

app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:5500",
    "https://sulky-manager-frontend.onrender.com"
  ],
  credentials: true
}));


/* ==================================================
   MIDDLEWARES
================================================== */

app.use(express.json());


/* ==================================================
   ROUTES API
================================================== */

app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/bets", require("./routes/bets"));
app.use("/api/results", require("./routes/results"));
app.use("/api/races", require("./routes/races")); // ⭐ route principale réunions/courses


/* ==================================================
   TEST ROUTE
================================================== */

app.get("/", (req, res) => {
  res.send("Sulky Bet API running");
});


/* ==================================================
   SERVER START
================================================== */

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
