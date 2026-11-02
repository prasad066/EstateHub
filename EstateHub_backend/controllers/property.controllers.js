
const Property = require("../model/property.model");
const Booking = require("../model/booking.model");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function uploadImage(file) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "estatehub/properties",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );

    stream.end(file.buffer);
  });
}

const addproperty = async (req, res) => {
  try {
    const propertyData = JSON.parse(req.body.propertyData);

    const images = await Promise.all(
      (req.files || []).map((file) => uploadImage(file))
    );

    const property = new Property({
      ...propertyData,
      images: images,
    });

    const result = await property.save();

    res.send({
      msg: "Property added successfully",
      property: result,
    });
  } catch (err) {
    console.log(err);
    res.send({ msg: "Error adding property" });
  }
};

async function getproperty(req, res) {
  try {
    const properties = await Property.find();
    res.status(200).send({ msg: "Properties fetched successful", properties });
  } catch (err) {
    res.status(500).send({ msg: "Error fetching properties" });
  }
}

async function filterproperty(req, res) {
  let filter = {};

  if (req.query.property) {
    filter._id = req.query.property;
  }

  if (req.query.id) {
    filter.listedBy = req.query.id;
  }

  if (req.query.city) {
    filter["address.city"] = req.query.city;
  }

  if (req.query.priceRange) {
    filter.price = { $lte: Number(req.query.priceRange) };
  }

  if (req.query.isAvailable !== undefined) {
    filter.isAvailable = req.query.isAvailable === "true";
  }

  if (req.query.status) {
    filter.status = req.query.status;
  }

  if (req.query.listingType) {
    filter.listingType = req.query.listingType;
  }

  if (req.query.propertyType) {
    filter.propertyType = req.query.propertyType;
  }

  if (req.query.furnishing) {
    filter.furnishing = req.query.furnishing;
  }

  const properties = await Property.find(filter);

  if (properties.length != 0) {
    res.send({
      msg: "Properties filtered successful",
      properties,
    });
  } else {
    res.send({ msg: "Error filtering properties" });
  }
}

async function deleteproperty(req, res) {
  const { property, id } = req.query;

  if (!property || !id) {
    res.send({ msg: "Property ID and seller ID are required" });
    return;
  }

  const deletedproperty = await Property.findOneAndDelete({
    _id: property,
    listedBy: id,
  });

  if (!deletedproperty) {
    res.send({ msg: "Property not found or unauthorized" });
    return;
  }

  await Booking.deleteMany({
    property: property,
  });

  res.send({
    msg: "Property and related bookings deleted successfully",
  });
}

async function updateproperty(req, res) {
  const { property } = req.body;

  if (!property) {
    res.send({ msg: "Property ID is required" });
    return;
  }

  const existingproperty = await Property.findById(property);

  if (!existingproperty) {
    res.send({ msg: "Property not found" });
    return;
  }

  if (existingproperty.status === "Pending") {
    if (existingproperty.listingType === "Sale") {
      existingproperty.status = "Sold";
    } else if (existingproperty.listingType === "Rent") {
      existingproperty.status = "Rented";
    }

    existingproperty.isAvailable = false;
  } else if (
    existingproperty.status === "Sold" ||
    existingproperty.status === "Rented"
  ) {
    existingproperty.status = "Pending";
    existingproperty.isAvailable = true;
  }

  await existingproperty.save();

  res.send({
    msg: "Property updated successful",
    property: existingproperty,
  });
}

module.exports = {
  addproperty,
  getproperty,
  filterproperty,
  deleteproperty,
  updateproperty,
};
