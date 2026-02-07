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
   🔹 Créditer un joueur
======================================== */
router.post("/add-balance", auth, admin, async (req, res) => {

  try {

    const { pseudo, amount } = req.body;

    if (!pseudo || !amount || amount <= 0)
      return res.status(400).json({ message: "Données invalides" });

    const user = await User.findOne({ pseudo });
    if (!user)
      return res.status(404).json({ message: "Utilisateur introuvable" });

    user.balance += Number(amount);
    await user.save();

    res.json({
      message: "Solde mis à jour",
      pseudo: user.pseudo,
      balance: user.balance
    });

  } catch {
    res.status(500).json({ message: "Erreur serveur" });
  }

});


/* ========================================
   🔹 Historique global des paris (ADMIN)
======================================== */
router.get("/bets", auth, admin, async (req, res) => {

  try {

    const bets = await Bet.find()
      .populate("user", "pseudo")
      .populate("race", "label")
      .sort({ createdAt: -1 });

    const formatted = bets.map(b => ({
      ...b.toObject(),
      userPseudo: b.user?.pseudo || "?",
      raceLabel: b.race?.label || "-"
    }));

    res.json(formatted);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }

});


/* ========================================
   🔥 RÈGLEMENT AUTOMATIQUE (FIX MINIMAL)
======================================== */
router.post("/settle-results", auth, admin, async (req, res) => {

  try {

    const {
      raceId,
      first,
      second,
      third,

      coteWin = 1,

      cotePlace1 = 1,
      cotePlace2 = 1,
      cotePlace3 = 1,

      coteCoupleWin = 1,

      coteCouple12 = 1,
      coteCouple13 = 1,
      coteCouple23 = 1,

      coteTrio = 1

    } = req.body;


    if (!raceId || !first || !second || !third)
      return res.status(400).json({ message: "Résultats incomplets" });


    /* ================= 🔥 FIX UNIQUEMENT ICI ================= */

    const meeting = await Race.findOne({ "races.id": raceId });

    if (!meeting)
      return res.status(404).json({ message: "Course introuvable" });

    const bets = await Bet.find({
      race: meeting._id,
      status: "pending"
    });

    /* ======================================================== */


    let winners = 0;


    for (const bet of bets) {

      const user = await User.findById(bet.user);
      if (!user) continue;

      const names = bet.chevaux.map(h => h.cheval);
      let gain = 0;


      if (bet.type === "simple_win" && names.includes(first))
        gain = bet.montant * coteWin;


      else if (bet.type === "simple_place") {

        if (names[0] === first) gain = bet.montant * cotePlace1;
        else if (names[0] === second) gain = bet.montant * cotePlace2;
        else if (names[0] === third) gain = bet.montant * cotePlace3;
      }


      else if (bet.type === "couple_win" &&
        [first, second].every(h => names.includes(h)))
        gain = bet.montant * coteCoupleWin;


      else if (bet.type === "couple_place") {

        const pair = names.sort().join("-");

        const map = {
          [[first, second].sort().join("-")]: coteCouple12,
          [[first, third].sort().join("-")]: coteCouple13,
          [[second, third].sort().join("-")]: coteCouple23
        };

        if (map[pair])
          gain = bet.montant * map[pair];
      }


      else if (bet.type === "trio" &&
        [first, second, third].every(h => names.includes(h)))
        gain = bet.montant * coteTrio;


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


    await Result.findOneAndUpdate(
      { raceId },
      {
        raceId,
        first,
        second,
        third,
        coteWin,
        cotePlace1,
        cotePlace2,
        cotePlace3,
        coteCoupleWin,
        coteCouple12,
        coteCouple13,
        coteCouple23,
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


/* ========================================
   🔹 CRUD Réunions / Courses / Runners
======================================== */

router.post("/create-reunion", auth, admin, async (req, res) => {
  const doc = await Race.create({
    reunion: req.body.reunion,
    date: req.body.date,
    races: []
  });
  res.json({ id: doc._id });
});


router.post("/add-course", auth, admin, async (req, res) => {

  await Race.findByIdAndUpdate(req.body.reunionId, {
    $push: {
      races: {
        id: req.body.id,
        label: req.body.label,
        date: req.body.date,
        partants: []
      }
    }
  });

  res.json({ message: "Course ajoutée" });
});


router.post("/add-runner", auth, admin, async (req, res) => {

  await Race.updateOne(
    { _id: req.body.reunionId, "races.id": req.body.raceId },
    {
      $push: {
        "races.$.partants": {
          cheval: req.body.cheval,
          driver: req.body.driver,
          proprietaire: req.body.proprietaire,
          musique: req.body.musique,
          cote: req.body.cote
        }
      }
    }
  );

  res.json({ message: "Partant ajouté" });
});


module.exports = router;
