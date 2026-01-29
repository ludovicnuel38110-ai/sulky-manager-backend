const mongoose = require("mongoose");

const RaceSchema = new mongoose.Schema({
  name: String,
  date: String,
  races: Array   // on stocke les C1, C2 etc ici
});

module.exports = mongoose.model("Race", RaceSchema);
