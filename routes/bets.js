const express = require("express");
const router = express.Router();

const Bet = require("../models/Bet");
const User = require("../models/User");
const Race = require("../models/race"); // ⭐ important
const auth = require("../middleware/auth");


/* =================================================
   🔹 Helper validation chevaux
================================================= */

function requiredCount(type){
  switch(type){
    case "simple_win":
    case "simple_place": return 1;
    case "couple": return 2;
    case "trio": return 3;
    default: return 1;
  }
}


/* =================================================
   🔹 Historique utilisateur
================================================= */

router.get("/me", auth, async (req, res) => {

  const bets = await Bet.find({ userId: req.user.id })
    .sort({ createdAt: -1 });

  res.json(bets);

});


/* =================================================
   🔹 POST PARI (SÉCURISÉ + FERMETURE 30MIN)
================================================= */

router.post("/", auth, async (req, res) => {

  try {

    const { raceId, chevaux, type, montant } = req.body;

    /* ========= VALIDATION BASIQUE ========= */

    if (!raceId || !chevaux || !chevaux.length || !montant || montant <= 0)
      return res.status(400).json({ message: "Données invalides" });


    /* ========= VALIDATION NOMBRE CHEVAUX ========= */

    const needed = requiredCount(type);

    if (chevaux.length !== needed)
      return res.status(400).json({
        message: `Ce pari nécessite ${needed} cheval(x)`
      });


    /* ========= 🔴 FERMETURE 30 MINUTES ========= */

    const meeting = await Race.findOne({ "races.id": raceId });

    if (!meeting)
      return res.status(404).json({ message: "Course introuvable" });

    const course = meeting.races.find(r => r.id === raceId);

    const raceTime = new Date(course.date).getTime();
    const now = Date.now();

    const THIRTY_MIN = 30 * 60 * 1000;

    if (raceTime - now <= THIRTY_MIN) {
      return res.status(400).json({
        message: "Paris fermés pour cette course"
      });
    }

    /* ======================================= */


    const user = await User.findById(req.user.id);

    if (!user)
      return res.status(404).json({ message: "Utilisateur introuvable" });

    if (user.balance < montant)
      return res.status(400).json({ message: "Solde insuffisant" });


    /* ========= DÉBIT ========= */

    user.balance -= montant;
    await user.save();


    /* ========= CALCUL GAIN ========= */

    const coteMoyenne =
      chevaux.reduce((acc, h) => acc + Number(h.cote), 0) / chevaux.length;

    const gainPotentiel = montant * coteMoyenne;


    /* ========= CREATE BET ========= */

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

  }
  catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }

});


module.exports = router;
