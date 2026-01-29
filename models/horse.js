const mongoose = require("mongoose");

const horseSchema = new mongoose.Schema({
  number: Number,
  name: String,
  driver: String,
  owner: String,
  music: String,
  odds: Number,

  race: { type: mongoose.Schema.Types.ObjectId, ref: "Race" }
});

module.exports = mongoose.model("Horse", horseSchema);
