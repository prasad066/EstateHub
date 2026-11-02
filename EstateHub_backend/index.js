
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const path = require("path");

const userrouter = require("./routes/user.routes");
const propertyrouter = require("./routes/property.routes");
const dbconnection = require("./database/db.connection");
const { favoriterouter } = require("./routes/favorite.routes");
const bookingrouter = require("./routes/booking.routes");

dbconnection();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

function checkToken(req, res, next) {
  const token = req.headers.token;

  if (!token) {
    return res.status(401).send({ msg: "token not found" });
  }

  try {
    const verifiedToken = jwt.verify(token, process.env.JWT_SECRET);

    req.email = verifiedToken;
    next();
  } catch (err) {
    return res.status(401).send({ msg: "invalid or expired token" });
  }
}

app.use("/user", userrouter);
app.use("/property", checkToken, propertyrouter);
app.use("/favorite", checkToken, favoriterouter);
app.use("/bookings", checkToken, bookingrouter);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`EstateHub backend server running on port ${PORT}`);
});
