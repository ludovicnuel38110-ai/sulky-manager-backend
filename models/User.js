const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  pseudo: { type: String, unique: true },
  password: String,
  balance: { type: Number, default: 1000 }
});

module.exports = mongoose.model("User", userSchema);
