const mongoose = require("mongoose");

const partantSchema = new mongoose.Schema({
  cheval: String,
  driver: String,
  proprietaire: String,
  musique: String,
  cote: Number
});

const courseSchema = new mongoose.Schema({
  reunion: String,        // ex: "R1 – VINCENNES"
  date: String,           // ex: "Dimanche 01 février 2026"
  races: [
    {
      id: Number,         // ex: 101
      label: String,      // ex: "C1 – Prix de Moutiers"
      partants: [partantSchema]
    }
  ]
});

module.exports = mongoose.model("Course", courseSchema);
