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
