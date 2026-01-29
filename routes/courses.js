const express = require("express");
const router = express.Router();
const Course = require("../models/race");

/* 🔹 Liste des réunions */
router.get("/", async (req, res) => {
  const reunions = await Course.find({}, { reunion:1, date:1 });
  res.json(reunions);
});

/* 🔹 Liste des courses d’une réunion */
router.get("/reunion/:id", async (req, res) => {
  const reunion = await Course.findById(req.params.id);
  res.json(reunion.races);
});

/* 🔹 Détail d’une course + partants */
router.get("/:raceId", async (req, res) => {
  const courses = await Course.findOne(
    { "races.id": Number(req.params.raceId) },
    { "races.$": 1 }
  );

  if (!courses) return res.status(404).json({ message:"Course introuvable" });

  res.json(courses.races[0]);
});

module.exports = router;
