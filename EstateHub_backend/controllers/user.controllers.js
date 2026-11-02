const User = require("../model/users.model");
const jwt = require("jsonwebtoken");
async function adduser(req, res) {
  console.log(req.body);

  const existinguser = await User.findOne({ email: req.body.email });

  if (existinguser) {
    return res.send({ msg: "user already exist" });
  }

  const newuser = User(req.body);
  await newuser.save();

  console.log({ message: "user added successful", userdetails: req.body });

  res.send({ msg: "user added successful" });
}
const getuser = async (req, res) => {
  const user = await User.findOne({
    email: req.body.email,
    password: req.body.password,
  });
  if (user) {
    const token = jwt.sign(user.email, "secret");
    res.send({
      role: user.role,
      name: user.name,
      email: user.email,
      phone: user.phone,
      id: user._id,
      token,
    });
  } else {
    res.send({ msg: "user not found" });
  }
};
const getuserbyid = async (req, res) => {
  const user = await User.findOne({
    _id: req.params.id,
  });
  console.log(req.params.id);
  if (user) {
    res.send({
      name: user.name,
      email: user.email,
      phone: user.phone,
    });
  } else {
    res.send({ msg: "user not found" });
  }
};
const deleteuser = async (req, res) => {
  const user = await User.findOneAndDelete({
    email: req.body.email,
  });
  console.log(user);
  if (user) {
    res.send({ msg: "user deleted successfully" });
  } else {
    res.send({ msg: "user not found" });
  }
};
const updateuser = async (req, res) => {
  const { name, email, phone } = req.body;
  const { id } = req.params;

  if (!name?.trim() || !email?.trim() || !phone?.trim()) {
    res.send({ msg: "Name, email and phone are required" });
    return;
  }

  try {
    const user = await User.findByIdAndUpdate(id, {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
    });

    if (!user) {
      res.send({ msg: "User not found" });
      return;
    }

    res.send({
      msg: "Profile updated successfully",
      user: {
        name: name,
        email: email,
        phone: phone,
      },
    });
  } catch (err) {
    if (err.code === 11000) {
      res.send({ msg: "Email already exists" });
      return;
    }

    res.send({ msg: "Failed to update profile" });
  }
};
module.exports = { adduser, getuser, deleteuser, getuserbyid, updateuser };
