const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  pseudo: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  balance: {
    type: Number,
    default: 1000
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model("User", userSchema);
