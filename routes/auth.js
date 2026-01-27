const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { pseudo, password } = req.body;

    const existing = await User.findOne({ pseudo });
    if (existing) return res.status(400).json({ error: "Pseudo déjà utilisé" });

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      pseudo,
      password: hashed,
      balance: 100
    });

    await user.save();
    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// LOGIN  ✅ (ton code)
router.post("/login", async (req, res) => {
  try {
    const { pseudo, password } = req.body;

    const user = await User.findOne({ pseudo });
    if (!user) return res.status(400).json({ error: "Pseudo invalide" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Mot de passe incorrect" });

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
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
