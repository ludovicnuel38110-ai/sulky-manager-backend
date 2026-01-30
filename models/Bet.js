const mongoose = require("mongoose");

const betSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  raceId: {
    type: Number,
    required: true
  },

  chevaux: [
    {
      cheval: String
    }
  ],

  type: {
    type: String,
    default: "simple_win"
  },

  montant: {
    type: Number,
    required: true
  },

  gain: {
    type: Number,
    default: 0
  },

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
