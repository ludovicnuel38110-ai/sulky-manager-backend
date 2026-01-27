const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

/* REGISTER */
router.post("/register", async (req, res) => {
  try {
    const { pseudo, password } = req.body;

    if (!pseudo || !password) {
      return res.status(400).json({ message: "Pseudo et mot de passe requis" });
    }

    const exist = await User.findOne({ pseudo });
    if (exist) {
      return res.status(400).json({ message: "Pseudo déjà utilisé" });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      pseudo,
      password: hash,
      balance: 1000
    });

    res.json({
      message: "Compte créé",
      pseudo: user.pseudo
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

/* LOGIN */
router.post("/login", async (req, res) => {
  try {
    const { pseudo, password } = req.body;

    const user = await User.findOne({ pseudo });
    if (!user) return res.status(400).json({ message: "Pseudo incorrect" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: "Mot de passe incorrect" });

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
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
