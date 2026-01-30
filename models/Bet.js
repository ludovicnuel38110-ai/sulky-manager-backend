const mongoose = require("mongoose");

const betSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  raceId: Number,
  cheval: String,

  montant: Number,
  cote: Number,

  gainPotentiel: Number,

  status: {
    type: String,
    enum: ["pending", "win", "lose"],
    default: "pending"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Bet", betSchema);
