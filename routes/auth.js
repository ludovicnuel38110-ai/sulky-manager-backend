const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { pseudo, password } = req.body;

    if (!pseudo || !password) {
      return res.status(400).json({ error: "Champs manquants" });
    }

    const existing = await User.findOne({ pseudo });
    if (existing) {
      return res.status(400).json({ error: "Pseudo déjà utilisé" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      pseudo,
      password: hashed,
      balance: 1000 // argent de départ
    });

    const token = jwt.sign(
      { id: user._id, pseudo: user.pseudo },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      pseudo: user.pseudo,
      balance: user.balance
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
