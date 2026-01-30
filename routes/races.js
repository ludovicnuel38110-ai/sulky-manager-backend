const express = require("express");
const router = express.Router();

const Race = require("../models/race");


/* =========================================
   ✅ LISTE des réunions
   GET /api/races
========================================= */
router.get("/", async (req, res) => {
  try {
    const reunions = await Race.find();
    res.json(reunions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});


/* =========================================
   ✅ COURSES d’une réunion
   GET /api/races/reunion/:reunionId
========================================= */
router.get("/reunion/:reunionId", async (req, res) => {
  try {

    const reunion = await Race.findById(req.params.reunionId);

    if (!reunion) {
      return res.status(404).json({ message: "Réunion introuvable" });
    }

    res.json(reunion.races || []);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});


/* =========================================
   ✅ DÉTAIL d’une course + partants
   GET /api/races/:id
========================================= */
router.get("/:id", async (req, res) => {
  try {

    const raceId = Number(req.params.id);

    const reunion = await Race.findOne({
      "races.id": raceId
    });

    if (!reunion) {
      return res.status(404).json({ message: "Course introuvable" });
    }

    const race = reunion.races.find(r => r.id === raceId);

    res.json(race);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});


module.exports = router;
