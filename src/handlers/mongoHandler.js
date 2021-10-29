const mongoose = require("mongoose");
const settings = require("../configs/settings.json");

mongoose.connect(settings.mongoUrl, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useFindAndModify: false,
});

mongoose.connection.on("connected", () => {
  console.log("Mongoya Bağlandı!");
});
mongoose.connection.on("error", () => {
  console.error("Mongoose Bağlantı Hatası Oldu!");
});
