const mongoose = require("mongoose");

const betSchema = new mongoose.Schema({

  /* 🔹 Joueur */
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  /* 🔹 Course */
  raceId: {
    type: Number,
    required: true
  },

  /* 🔹 Chevaux sélectionnés (multi pari) */
  chevaux: [
    {
      cheval: String,
      cote: Number
    }
  ],

  /* 🔹 Type de pari */
  type: {
    type: String,
    enum: ["simple_win", "simple_place", "couple", "trio"],
    default: "simple_win"
  },

  /* 🔹 Mise */
  montant: {
    type: Number,
    required: true
  },

  /* 🔹 Gain potentiel calculé au moment du pari */
  gainPotentiel: {
    type: Number,
    default: 0
  },

  /* 🔹 Gain réel après règlement */
  gain: {
    type: Number,
    default: 0
  },

  /* 🔹 Statut */
  status: {
    type: String,
    enum: ["pending", "win", "lose"],
    default: "pending"
  },

  /* 🔹 Date */
  createdAt: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("Bet", betSchema);
