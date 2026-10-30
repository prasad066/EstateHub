const Favorite = require("../model/favorite.model");
const getfavorites = async (req, res) => {
  const favorites = await Favorite.findOne({
    user: req.query.user,
  });
  if (favorites) {
    return res.send({
      msg: "successfully got favorites",
      favorites,
    });
  }
  return res.send({
    msg: "there are no favorites",
  });
};
const addfavorites = async (req, res) => {
  const { user, property } = req.body;
  const alreadyexist = await Favorite.findOne({
    user,
    properties: property,
  });
  if (alreadyexist) {
    return res.send({
      msg: "already in wishlist",
    });
  }
  const userexist = await Favorite.findOne({ user });
  if (userexist) {
    await Favorite.findByIdAndUpdate(
      userexist._id,
      {
        $push: { properties: property },
      },
      { new: true },
    );
    return res.send({
      msg: "property added to existing wishlist",
    });
  } else {
    const newuser = new Favorite({
      user,
      properties: [property],
    });
    await newuser.save();
    return res.send({
      msg: "wishlist created successfully",
    });
  }
};

const deletefavorites = async (req, res) => {
  const { user, property } = req.body;

  const favorites = await Favorite.findOneAndUpdate(
    { user },
    { $pull: { properties: property } },
    { new: true },
  );

  if (!favorites) {
    return res.send({
      msg: "wishlist not found",
    });
  }

  return res.send({
    msg: "property removed from wishlist",
  });
};

module.exports = { getfavorites, addfavorites, deletefavorites };
