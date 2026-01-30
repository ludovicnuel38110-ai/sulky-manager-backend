const express = require("express");
const router = express.Router();

const Bet = require("../models/Bet");
const User = require("../models/User");
const auth = require("../middleware/auth");


/* 🔹 Placer un pari */
router.post("/", auth, async (req, res) => {
  try {
    const { raceId, cheval, cote, montant } = req.body;

    if (!raceId || !cheval || !montant || montant <= 0) {
      return res.status(400).json({ message: "Données invalides" });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    if (user.balance < montant) {
      return res.status(400).json({ message: "Solde insuffisant" });
    }

    /* débit du solde */
    user.balance -= montant;
    await user.save();

    /* création du pari */
    const bet = await Bet.create({
      userId: user._id,
      raceId,
      cheval,
      cote,
      montant,
      gainPotentiel: montant * cote
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
