const { Schema, model } = require("mongoose");

const schema = Schema({
  guildID: { type: String, default: "" },
  sayi: { type: Number, default : 0},
  userID: { type: String, default: "" },
  taggeds: { type: Array, default: [] }
});

module.exports = model("taggeds", schema);
