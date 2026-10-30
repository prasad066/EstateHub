const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const path = require("path");
const userrouter = require("./routes/user.routes");
const propertyrouter = require("./routes/property.routes");
const dbconnection = require("./database/db.connection");
const { favoriterouter } = require("./routes/favorite.routes");
const bookingrouter = require("./routes/booking.routes");
// const  favorite = require("./routes/favorite.routes");
dbconnection();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


function checkToken(req, res, next) {
  const token=jwt.verify(req.headers.token,"secret");
  if(!token){
    res.status(401).send({msg:"token not found"})
  }
  if(token){
    req.email=token;
    next();
  }
}
app.use("/user", userrouter);
app.use("/property", checkToken, propertyrouter);
app.use("/favorite", checkToken,favoriterouter);
app.use("/bookings",checkToken,bookingrouter);

app.listen(4000, () => {
  console.log("EstateHub backend server running on port 4000");
});
