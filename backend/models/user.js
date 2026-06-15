//THIS IS USER.JS
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  userId: String,
  aesKey: String
});

module.exports = mongoose.model("User", userSchema);