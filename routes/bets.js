const express = require("express");
const router = express.Router();

const Bet = require("../models/Bet");
const User = require("../models/User");
const auth = require("../middleware/auth");


/* =========================
   🔹 Historique utilisateur
========================= */
router.get("/me", auth, async (req, res) => {

  const bets = await Bet.find({ userId: req.user.id })
    .sort({ createdAt: -1 });

  res.json(bets);

});


/* =========================
   🔹 Placer un pari (NEW slip compatible)
========================= */
router.post("/", auth, async (req, res) => {
  try {

    const { raceId, chevaux, type, montant } = req.body;

    if (!raceId || !chevaux || !chevaux.length || !montant || montant <= 0) {
      return res.status(400).json({ message: "Données invalides" });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    if (user.balance < montant) {
      return res.status(400).json({ message: "Solde insuffisant" });
    }

    /* 🔻 Débit */
    user.balance -= montant;
    await user.save();

    /* 🔸 Cote moyenne simple (temporaire, améliorable plus tard) */
    const coteMoyenne =
      chevaux.reduce((acc, h) => acc + Number(h.cote), 0) / chevaux.length;

    const gainPotentiel = montant * coteMoyenne;

    /* 🔹 Création pari */
    const bet = await Bet.create({
      userId: user._id,
      raceId,
      chevaux,
      type,
      montant,
      gain: 0,
      gainPotentiel,
      status: "pending"
    });

    res.json({
      message: "Pari enregistré",
      balance: user.balance,
      bet
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});


module.exports = router;
