
const mongoose = require("mongoose");

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
