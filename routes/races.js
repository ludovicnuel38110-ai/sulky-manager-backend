const express = require("express");
const router = express.Router();

const Race = require("../models/race"); // ton modèle Mongo


/* =========================================
   GET course complète + partants
   /api/races/:id
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
