const { Schema, model } = require("mongoose");

const schema = Schema({
  guildID: { type: String, default: "" },
  userID: { type: String, default: "" },
  erkekUye:{ type: Number,default:0},
  kadinUye:{ type: Number,default:0},
  coin: { type: Number, default: 0 },
  public: {type: Number, default : 0},
  diğer: {type: Number, default: 0},
  kayıt: {type: Number, default : 0},
  alone: {type: Number, default : 0},
  secret: {type: Number, default : 0},
  oyun: {type: Number, default : 0}


});

module.exports = model("coin", schema);
