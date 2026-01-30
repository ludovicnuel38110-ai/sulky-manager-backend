const mongoose = require("mongoose");


/* =========================
   Partant
========================= */
const RunnerSchema = new mongoose.Schema({
  cheval: String,
  driver: String,
  proprietaire: String,
  musique: String,
  cote: Number
});


/* =========================
   Course
========================= */
const CourseSchema = new mongoose.Schema({
  id: Number,          // 101, 102 etc
  label: String,       // C1 – Prix ...
  date: String,
  partants: [RunnerSchema]
});


/* =========================
   Réunion
========================= */
const RaceSchema = new mongoose.Schema({
  reunion: String,     // R1 – Vincennes
  date: String,
  races: [CourseSchema]
});


module.exports = mongoose.model("Race", RaceSchema);
