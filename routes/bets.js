const express = require("express");
const router = express.Router();

const Bet = require("../models/Bet");
const User = require("../models/User");
const Race = require("../models/race"); // ton fichier est minuscule
const auth = require("../middleware/auth");


/* =================================================
   🔹 Helper validation chevaux
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
   🔹 Historique utilisateur
================================================= */

router.get("/me", auth, async (req, res) => {

  try{

    const bets = await Bet.find({ user: req.user.id }) // ✅ user PAS userId
      .populate("race","label")
      .sort({ createdAt: -1 });

    res.json(bets);

  }catch(err){
    console.error(err);
    res.status(500).json({ message:"Erreur serveur" });
  }

});


/* =================================================
   🔹 POST PARI
================================================= */

router.post("/", auth, async (req, res) => {

  try {

    const { raceId, chevaux, type, montant } = req.body;

    if (!raceId || !chevaux?.length || !montant || montant <= 0)
      return res.status(400).json({ message: "Données invalides" });


    const needed = requiredCount(type);

    if (chevaux.length !== needed)
      return res.status(400).json({
        message: `Ce pari nécessite ${needed} cheval(x)`
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

    if (!user || user.balance < montant)
      return res.status(400).json({ message: "Solde insuffisant" });


    user.balance -= montant;
    await user.save();


    /* ========= CREATE BET ========= */

    const bet = await Bet.create({

      user: user._id,          // ✅ CORRECT
      race: meeting._id,       // ✅ CORRECT

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
