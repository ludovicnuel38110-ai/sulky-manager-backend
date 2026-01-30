const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Bet = require("../models/Bet"); // ⭐ IMPORTANT
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");


/* ========================================
   🔹 Créditer un joueur
======================================== */
router.post("/add-balance", auth, admin, async (req, res) => {
  try {

    const { pseudo, amount } = req.body;

    if (!pseudo || !amount || amount <= 0) {
      return res.status(400).json({ message: "Données invalides" });
    }

    const user = await User.findOne({ pseudo });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    user.balance += Number(amount);
    await user.save();

    res.json({
      message: "Solde mis à jour",
      pseudo: user.pseudo,
      balance: user.balance
    });

  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});


/* ========================================
   🔹 Régler une course (AUTO GAIN)
======================================== */
router.post("/settle-race", auth, admin, async (req, res) => {
  try {

    const { raceId, gagnant } = req.body;

    if (!raceId || !gagnant) {
      return res.status(400).json({ message: "Données manquantes" });
    }

    const bets = await Bet.find({
      raceId,
      status: "pending"
    });

    let winners = 0;

    for (const bet of bets) {

      const user = await User.findById(bet.userId);

      const isWinner =
        bet.chevaux?.some(h => h.cheval === gagnant) ||
        bet.cheval === gagnant;

      if (isWinner) {

        const gain = bet.gainPotentiel;

        user.balance += gain;
        await user.save();

        bet.status = "win";
        bet.gain = gain;

        winners++;

      } else {

        bet.status = "lose";
        bet.gain = 0;
      }

      await bet.save();
    }

    res.json({
      message: "Course réglée",
      winners,
      totalBets: bets.length
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});


module.exports = router;
