const express = require("express");
const router = express.Router();

/* Liste des courses */
router.get("/", (req, res) => {
  res.json([
    {
      id: 1,
      name: "R1 – VINCENNES",
      date: "Dimanche 01 février 2026",
      link: "vincennes.html"
    },
    {
      id: 2,
      name: "R2 – ENGHIEN",
      date: "Lundi 02 février 2026",
      link: null
    }
  ]);
});

module.exports = router;
// Détail d'une réunion
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);

  if (id === 1) {
    return res.json({
      id: 1,
      name: "R1 – VINCENNES",
      date: "2026-02-01",
      races: [
        { id: 101, label: "C1 – Prix de Moutiers" },
        { id: 102, label: "C2 – Prix Indienne" },
        { id: 103, label: "C3 – Prix Leopold Verroken" }
      ]
    });
  }

  if (id === 2) {
    return res.json({
      id: 2,
      name: "R2 – ENGHIEN",
      date: "2026-02-02",
      races: [
        { id: 201, label: "C1 – Prix de Paris" }
      ]
    });
  }

  res.status(404).json({ error: "Réunion introuvable" });
});
