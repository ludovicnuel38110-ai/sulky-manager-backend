const mongoose = require("mongoose");

const betSchema = new mongoose.Schema({

  /* ================= USER ================= */

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  /* ================= COURSE ================= */

  race: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Race",
    required: true
  },

  /* ================= CHEVAUX ================= */

  chevaux: [
    {
      cheval: String
    }
  ],

  /* ================= TYPE PARI ================= */

  type: {
    type: String,
    default: "simple_win"
  },

  /* ================= MONTANT ================= */

  montant: {
    type: Number,
    required: true
  },

  gain: {
    type: Number,
    default: 0
  },

  /* ================= STATUT ================= */

  status: {
    type: String,
    enum: ["pending", "win", "lose"],
    default: "pending"
  }

},
{
  /* 🔥 ULTRA IMPORTANT POUR ADMIN PANEL */
  timestamps: true
  /*
    créé automatiquement :
    createdAt
    updatedAt
  */
});

module.exports = mongoose.model("Bet", betSchema);
