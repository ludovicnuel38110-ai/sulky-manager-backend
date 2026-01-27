const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

/* ======================
   REGISTER
====================== */
router.post("/register", async (req, res) => {
  try {
    // le frontend envoie "username"
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Pseudo et mot de passe requis" });
    }

    // on stocke en base sous "pseudo"
    const exist = await User.findOne({ pseudo: username });
    if (exist) {
      return res.status(400).json({ error: "Pseudo déjà pris" });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      pseudo: username,
      password: hash,
      balance: 0
    });

    res.json({
      message: "Compte créé",
      username: user.pseudo,
      balance: user.balance
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/* ======================
   LOGIN
====================== */
router.post("/login", async (req, res) => {
  try {
    // le frontend envoie "username"
    const { username, password } = req.body;

    const user = await User.findOne({ pseudo: username });
    if (!user) {
      return res.status(400).json({ error: "Pseudo incorrect" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(400).json({ error: "Mot de passe incorrect" });
    }

    const token = jwt.sign(
      { id: user._id, pseudo: user.pseudo },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      username: user.pseudo,
      balance: user.balance
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
