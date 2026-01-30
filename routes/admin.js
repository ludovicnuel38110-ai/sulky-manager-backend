const express = require("express");
const router = express.Router();

/* ================= IMPORTS ================= */

const User = require("../models/User");
const Bet = require("../models/Bet");
const Race = require("../models/race");
const Result = require("../models/Result");

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

    const bets = await Bet.find({
      raceId,
      status: "pending"
    });

    let winners = 0;

    for (const bet of bets) {

      const user = await User.findById(bet.userId);
      if (!user) continue;

      const names = (bet.chevaux || []).map(h => h.cheval);
      let gain = 0;

      /* SIMPLE WIN */
      if (bet.type === "simple_win" && names.includes(first)) {
        gain = bet.montant * coteWin;
      }

      /* SIMPLE PLACE */
      else if (bet.type === "simple_place" && [first, second, third].includes(names[0])) {
        gain = bet.montant * cotePlace;
      }

      /* COUPLE GAGNANT */
      else if (bet.type === "couple" && [first, second].every(h => names.includes(h))) {
        gain = bet.montant * coteCouple;
      }

      /* COUPLE PLACE */
      else if (bet.type === "couple_place") {
        const combos = [
          [first, second],
          [first, third]
        ];
        if (combos.some(c => c.every(h => names.includes(h)))) {
          gain = bet.montant * coteCouple;
        }
      }

      /* TRIO */
      else if (bet.type === "trio" && [first, second, third].every(h => names.includes(h))) {
        gain = bet.montant * coteTrio;
      }

      /* PAIEMENT */
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

    /* 🔹 Sauvegarder résultat */
    await Result.findOneAndUpdate(
      { raceId },
      {
        raceId,
        first,
        second,
        third,
        coteWin,
        cotePlace,
        coteCouple,
        coteTrio
      },
      { upsert: true }
    );

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


/* =========================================
   🔹 Créer une réunion
========================================= */
router.post("/create-reunion", auth, admin, async (req, res) => {
  const { reunion, date } = req.body;

  const doc = await Race.create({
    reunion,
    date,
    races: []
  });

  res.json({ message: "Réunion créée", id: doc._id });
});


/* =========================================
   🔹 Ajouter course
========================================= */
router.post("/add-course", auth, admin, async (req, res) => {

  const { reunionId, id, label, date } = req.body;

  await Race.findByIdAndUpdate(reunionId, {
    $push: {
      races: {
        id,
        label,
        date,
        partants: []
      }
    }
  });

  res.json({ message: "Course ajoutée" });
});


/* =========================================
   🔹 Ajouter cheval
========================================= */
router.post("/add-runner", auth, admin, async (req, res) => {

  const {
    reunionId,
    raceId,
    cheval,
    driver,
    proprietaire,
    musique,
    cote
  } = req.body;

  await Race.updateOne(
    { _id: reunionId, "races.id": raceId },
    {
      $push: {
        "races.$.partants": {
          cheval,
          driver,
          proprietaire,
          musique,
          cote
        }
      }
    }
  );

  res.json({ message: "Partant ajouté" });
});


module.exports = router;
/* =========================================
   🔴 Supprimer une réunion complète
========================================= */
router.delete("/delete-reunion/:id", auth, admin, async (req, res) => {
  try {

    await Race.findByIdAndDelete(req.params.id);

    res.json({ message: "Réunion supprimée ✅" });

  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});


/* =========================================
   🔴 Supprimer une course
========================================= */
router.delete("/delete-course", auth, admin, async (req, res) => {
  try {

    const { reunionId, raceId } = req.body;

    await Race.updateOne(
      { _id: reunionId },
      {
        $pull: {
          races: { id: raceId }
        }
      }
    );

    res.json({ message: "Course supprimée ✅" });

  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});


/* =========================================
   🔴 Supprimer tous les chevaux d’une course
========================================= */
router.delete("/clear-runners", auth, admin, async (req, res) => {
  try {

    const { reunionId, raceId } = req.body;

    await Race.updateOne(
      { _id: reunionId, "races.id": raceId },
      {
        $set: {
          "races.$.partants": []
        }
      }
    );

    res.json({ message: "Partants supprimés ✅" });

  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});
