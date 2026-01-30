const express = require("express");
const router = express.Router();

const Race = require("../models/race");


/* ======================================
   🔹 Toutes les réunions
   GET /api/races
====================================== */
router.get("/", async (req, res) => {
  try {
    const reunions = await Race.find().sort({ date: -1 });
    res.json(reunions);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});


/* ======================================
   🔹 Courses d'une réunion
   GET /api/races/reunion/:id
====================================== */
router.get("/reunion/:id", async (req, res) => {
  try {
    const reunion = await Race.findById(req.params.id);

    if (!reunion) {
      return res.status(404).json({ message: "Réunion introuvable" });
    }

    res.json(reunion.races);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});


/* ======================================
   🔹 Détail d'une course
   GET /api/races/:raceId?reunion=xxx
====================================== */
router.get("/:raceId", async (req, res) => {
  try {
    const raceId = Number(req.params.raceId);
    const reunionId = req.query.reunion;

    const reunion = await Race.findById(reunionId);

    if (!reunion) {
      return res.status(404).json({ message: "Réunion introuvable" });
    }

    const race = reunion.races.find(r => r.id === raceId);

    if (!race) {
      return res.status(404).json({ message: "Course introuvable" });
    }

    res.json(race);

  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
