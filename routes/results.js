const express = require("express");
const router = express.Router();
const Result = require("../models/Result");

/* 🔹 Liste résultats */
router.get("/", async (req, res) => {

  const results = await Result.find()
    .sort({ createdAt:-1 });

  res.json(results);
});

module.exports = router;
