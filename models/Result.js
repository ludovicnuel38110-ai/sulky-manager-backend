const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({

  raceId: Number,

  first: String,
  second: String,
  third: String,

  /* ================= COTES ================= */

  coteWin: Number,

  /* 🔥 SIMPLE PLACE (3 cotes différentes) */
  cotePlace1: Number,
  cotePlace2: Number,
  cotePlace3: Number,

  /* 🔥 COUPLÉ */
  coteCoupleWin: Number,

  /* 🔥 COUPLÉ PLACÉ (3 combinaisons) */
  coteCouple12: Number,
  coteCouple13: Number,
  coteCouple23: Number,

  /* 🔥 TRIO */
  coteTrio: Number,

  createdAt: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("Result", resultSchema);
