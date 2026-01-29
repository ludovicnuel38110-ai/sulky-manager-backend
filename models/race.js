const mongoose = require("mongoose");

const raceSchema = new mongoose.Schema({
  label: { type: String, required: true },    // C1 – Prix de Moutiers
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" }
});

module.exports = mongoose.model("Race", raceSchema);
