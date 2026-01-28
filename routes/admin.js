const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

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

module.exports = router;
