const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Bet = require("../models/Bet");

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");


/* ========================================
   🔹 Créditer un joueur (admin)
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
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});



/* ========================================
   🔹 Règlement automatique complet PMU
   1er / 2e / 3e + cotes finales
======================================== */
router.post("/settle-results", auth, admin, async (req, res) => {

  try {

    const {
      raceId,
      first,
      second,
      third,
      coteWin = 1,
      cotePlace = 1,
      coteCouple = 1,
      coteTrio = 1
    } = req.body;

    if (!raceId || !first || !second || !third) {
      return res.status(400).json({ message: "Résultats incomplets" });
    }

    /* 🔹 récupérer tous les paris en attente */
    const bets = await Bet.find({
      raceId,
      status: "pending"
    });

    let winners = 0;

    for (const bet of bets) {

      const user = await User.findById(bet.userId);
      if (!user) continue; // sécurité

      const names = (bet.chevaux || []).map(h => h.cheval);

      let gain = 0;

      /* ======================
         SIMPLE GAGNANT
      ====================== */
      if (bet.type === "simple_win") {

        if (names.includes(first)) {
          gain = bet.montant * coteWin;
        }

      }

      /* ======================
         SIMPLE PLACE
      ====================== */
      else if (bet.type === "simple_place") {

        if ([first, second, third].includes(names[0])) {
          gain = bet.montant * cotePlace;
        }

      }

      /* ======================
         COUPLE GAGNANT
      ====================== */
      else if (bet.type === "couple") {

        if ([first, second].every(h => names.includes(h))) {
          gain = bet.montant * coteCouple;
        }

      }

      /* ======================
         COUPLE PLACE
      ====================== */
      else if (bet.type === "couple_place") {

        const combos = [
          [first, second],
          [first, third]
        ];

        if (combos.some(c => c.every(h => names.includes(h)))) {
          gain = bet.montant * coteCouple;
        }

      }

      /* ======================
         TRIO
      ====================== */
      else if (bet.type === "trio") {

        if ([first, second, third].every(h => names.includes(h))) {
          gain = bet.montant * coteTrio;
        }

      }

      /* ======================
         PAIEMENT
      ====================== */
      if (gain > 0) {

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
      message: "Résultats réglés automatiquement ✅",
      winners,
      total: bets.length
    });

  } catch (err) {

    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });

  }
});


module.exports = router;
