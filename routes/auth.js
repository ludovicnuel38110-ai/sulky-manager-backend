const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();

router.post("/register", async (req, res) => {
  const { pseudo, password } = req.body;

  if (!pseudo || !password)
    return res.status(400).json({ error: "Champs manquants" });

  const exists = await User.findOne({ pseudo });
  if (exists) return res.status(400).json({ error: "Pseudo déjà utilisé" });

  const hash = await bcrypt.hash(password, 10);

  await User.create({ pseudo, password: hash });

  res.json({ success: true });
});

router.post("/login", async (req, res) => {
  const { pseudo, password } = req.body;
  const user = await User.findOne({ pseudo });

  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ error: "Identifiants incorrects" });

  res.json({ success: true, pseudo: user.pseudo, balance: user.balance });
});

module.exports = router;
