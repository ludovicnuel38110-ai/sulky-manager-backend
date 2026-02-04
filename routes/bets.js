const express = require("express");
const router = express.Router();

const Bet = require("../models/Bet");
const User = require("../models/User");
const Race = require("../models/race");
const auth = require("../middleware/auth");


/* =================================================
   🔹 CONSTANTES SECURITE
================================================= */

const MAX_PER_COURSE = 20000;


/* =================================================
   🔹 Helper nombre chevaux
================================================= */

function requiredCount(type){
  switch(type){
    case "simple_win":
    case "simple_place":
      return 1;

    case "couple_win":
    case "couple_place":
      return 2;

    case "trio":
      return 3;

    default:
      return 1;
  }
}


/* =================================================
   🔹 LIMITES MAX PAR TYPE
================================================= */

function getMaxBet(type){
  const limits = {
    simple_win: 20000,
    simple_place: 20000,
    couple_win: 5000,
    couple_place: 10000,
    trio: 5000
  };

  return limits[type] || 0;
}


/* =================================================
   🔹 Historique utilisateur
================================================= */

router.get("/me", auth, async (req, res) => {

  try{

    const bets = await Bet.find({ user: req.user.id })
      .populate("race","label")
      .sort({ createdAt: -1 });

    res.json(bets);

  }catch(err){
    console.error(err);
    res.status(500).json({ message:"Erreur serveur" });
  }

});


/* =================================================
   🔹 POST PARI (ULTRA SECURISE)
================================================= */

router.post("/", auth, async (req, res) => {

  try {

    const { raceId, chevaux, type, montant } = req.body;

    /* ========= VALIDATION ========= */

    if (!raceId || !chevaux?.length || !montant || montant <= 0)
      return res.status(400).json({ message: "Données invalides" });


    /* ========= NOMBRE CHEVAUX ========= */

    const needed = requiredCount(type);

    if (chevaux.length !== needed)
      return res.status(400).json({
        message: `Ce pari nécessite ${needed} cheval(x)`
      });


    /* ========= LIMITE PAR PARI ========= */

    const maxType = getMaxBet(type);

    if (montant > maxType)
      return res.status(400).json({
        message: `Mise max autorisée : ${maxType}`
      });


    /* ========= FIND COURSE ========= */

    const meeting = await Race.findOne({ "races.id": raceId });

    if (!meeting)
      return res.status(404).json({ message: "Course introuvable" });

    const course = meeting.races.find(r => r.id === raceId);


    /* ========= FERMETURE 30MIN ========= */

    const raceTime = new Date(course.date).getTime();
    const now = Date.now();

    if (raceTime - now <= 30 * 60 * 1000)
      return res.status(400).json({
        message: "Paris fermés pour cette course"
      });


    /* ========= USER ========= */

    const user = await User.findById(req.user.id);

    if (!user)
      return res.status(404).json({ message: "Utilisateur introuvable" });

    if (user.balance < montant)
      return res.status(400).json({ message: "Solde insuffisant" });


    /* =================================================
       🔥 NOUVEAU : LIMITE PAR COURSE (IMPORTANT)
    ================================================= */

    const totalAlreadyBet = await Bet.aggregate([
      {
        $match: {
          user: user._id,
          race: meeting._id
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$montant" }
        }
      }
    ]);

    const total = totalAlreadyBet[0]?.total || 0;

    if (total + montant > MAX_PER_COURSE)
      return res.status(400).json({
        message: `Limite par course atteinte (${MAX_PER_COURSE})`
      });


    /* ========= DEBIT ========= */

    user.balance -= montant;
    await user.save();


    /* ========= CREATE BET ========= */

    const bet = await Bet.create({
      user: user._id,
      race: meeting._id,
      chevaux,
      type,
      montant,
      gain: 0,
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
