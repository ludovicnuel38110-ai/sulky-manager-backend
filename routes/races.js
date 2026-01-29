const express = require("express");
const router = express.Router();

// Détail d'une course
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);

  if (id === 101) {
    return res.json({
      id: 101,
      label: "C1 – Prix de Moutiers",
      horses: [
        {
          number: 1,
          name: "Fakir du Bourg",
          driver: "J-M Bazire",
          owner: "Ecurie Bazire",
          music: "1a2a3a",
          odds: 2.5
        },
        {
          number: 2,
          name: "Flash de Vrie",
          driver: "Nivard",
          owner: "Ecurie Nivard",
          music: "3a4a2a",
          odds: 4.1
        }
      ]
    });
  }

  res.status(404).json({ error: "Course introuvable" });
});

module.exports = router;
