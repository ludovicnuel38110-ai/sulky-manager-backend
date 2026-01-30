require("dotenv").config();
const express = require("express");
const cors = require("cors");
require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/courses", require("./routes/courses"));
app.use("/api/bets", require("./routes/bets"));
app.use("/api/results", require("./routes/results"));

app.get("/", (req, res) => {
  res.send("Sulky Bet API running");
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Server running on", PORT));
