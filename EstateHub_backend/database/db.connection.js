const mongoose = require("mongoose");
require("dotenv").config(); // Ensure you have the dotenv package installed

const connect = function () {
  mongoose
    .connect(process.env.MONGO_URI, {
      dbName: "estatehub",
    })
    .then(() => {
      console.log("connected to database");
    })
    .catch((err) => console.log(err));
};

module.exports = connect;
