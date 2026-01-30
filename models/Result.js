const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({

  raceId: Number,

  first: String,
  second: String,
  third: String,

  coteWin: Number,
  cotePlace: Number,
  coteCouple: Number,
  coteTrio: Number,

  createdAt: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("Result", resultSchema);
