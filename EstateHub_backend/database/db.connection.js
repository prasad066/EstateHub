const mongoose = require("mongoose");

const connect = function () {
  mongoose
    .connect('mongodb+srv://yajnagoud7810_db_user:6j8ozVKK0aaauiqe@yajnaprasad.ppz2eia.mongodb.net', {
      dbName: "estatehub",
    })
    .then(() => {
      console.log("connected to database");
    })
    .catch((err) => console.log(err));
};

module.exports = connect;
