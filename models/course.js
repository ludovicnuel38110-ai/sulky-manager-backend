const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true },     // R1 – VINCENNES
  date: { type: String, required: true },     // 2026-02-01
});

module.exports = mongoose.model("Course", courseSchema);
