const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Bet = require("../models/Bet"); // ✅ UNE SEULE FOIS
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
   🔹 Régler une course automatiquement
======================================== */
router.post("/settle-results", auth, admin, async (req, res) => {
  try {

    const {
      raceId,
      first,
      second,
      third,
      coteWin,
      cotePlace,
      coteCouple,
      coteTrio
    } = req.body;

    if(!raceId || !first || !second || !third){
      return res.status(400).json({ message:"Résultats incomplets" });
    }

    const bets = await Bet.find({
      raceId,
      status:"pending"
    });

    let winners = 0;

    for(const bet of bets){

      const user = await User.findById(bet.userId);

      const names = bet.chevaux.map(h => h.cheval);
      let gain = 0;

      /* ======================
         SIMPLE GAGNANT
      ====================== */
      if(bet.type === "simple_win"){
        if(names.includes(first)){
          gain = bet.montant * coteWin;
        }
      }

      /* ======================
         SIMPLE PLACE
      ====================== */
      if(bet.type === "simple_place"){
        if([first,second,third].includes(names[0])){
          gain = bet.montant * cotePlace;
        }
      }

      /* ======================
         COUPLE GAGNANT
      ====================== */
      if(bet.type === "couple"){
        const pair = [first,second];
        if(pair.every(h => names.includes(h))){
          gain = bet.montant * coteCouple;
        }
      }

      /* ======================
         COUPLE PLACE
      ====================== */
      if(bet.type === "couple_place"){
        const combos = [
          [first,second],
          [first,third]
        ];

        if(combos.some(c => c.every(h => names.includes(h)))){
          gain = bet.montant * coteCouple;
        }
      }

      /* ======================
         TRIO
      ====================== */
      if(bet.type === "trio"){
        const trio = [first,second,third];
        if(trio.every(h => names.includes(h))){
          gain = bet.montant * coteTrio;
        }
      }

      /* ======================
         PAIEMENT
      ====================== */
      if(gain > 0){
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
      message:"Résultats réglés automatiquement ✅",
      winners,
      total: bets.length
    });

  } catch(err){
    console.error(err);
    res.status(500).json({ message:"Erreur serveur" });
  }
});
