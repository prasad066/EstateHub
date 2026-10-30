const Booking = require("../model/booking.model");
const Property = require("../model/property.model");

const addBooking = async (req, res) => {
  console.log(req.body)
  const existing = await Booking.findOne({
    buyer: req.body.buyer,
    property: req.body.property,
  });
  console.log(existing)
  if (!existing) {
    const booking = new Booking(req.body);
    await booking.save();

    res.send({
      message: "Booking added successfully"
    });
  }
  else{
    res.send({
      message: "Already booked"
    });
    
  }
};

const getBookings = async (req, res) => {
  const bookings = await Booking.find();
  res.send(bookings);
};

const getBookingById = async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return res.send({ message: "Booking not found" });
  }

  res.send(booking);
};

const getBookingsByBuyer = async (req, res) => {
  const bookings = await Booking.find({
    buyer: req.params.buyer,
  });
  res.send(bookings);
};

const getBookingsBySeller = async (req, res) => {
  const bookings = await Booking.find({
    seller: req.params.seller,
  });

  res.send(bookings);
};

const deleteBooking = async (req, res) => {
  const booking = await Booking.findByIdAndDelete(req.params.id);

  if (!booking) {
    return res.send({ message: "Booking not found" });
  }

  res.send({
    message: "Booking deleted successfully",
  });
};



async function updateBookingStatus(req, res) {
  const { status, seller } = req.body;

  if (!["Confirmed", "Rejected"].includes(status)) {
    res.send({ message: "Invalid booking status" });
    return;
  }

  const booking = await Booking.findOne({
    _id: req.params.id,
    seller: seller,
  });

  if (!booking) {
    res.send({ message: "Booking not found or unauthorized" });
    return;
  }

  const property = await Property.findOne({
    _id: booking.property,
    listedBy: seller,
  });

  if (!property) {
    res.send({ message: "Property not found or unauthorized" });
    return;
  }

  if (status === "Confirmed") {
    if (
      !property.isAvailable &&
      booking.status !== "Confirmed"
    ) {
      res.send({ message: "Property is not available" });
      return;
    }

    if (booking.status === "Cancelled") {
      res.send({ message: "Cancelled booking cannot be accepted" });
      return;
    }

    property.status =
      property.listingType === "Sale" ? "Sold" : "Rented";
    property.isAvailable = false;
    await property.save();

    await Booking.updateMany(
      {
        property: booking.property,
        seller: seller,
        status: "Pending",
        _id: { $ne: booking._id },
      },
      {
        $set: { status: "Rejected" },
      }
    );

    booking.status = "Confirmed";
    await booking.save();

    res.send({
      message: "Buyer accepted and property updated successfully",
      booking,
      property,
    });
    return;
  }

  if (booking.status === "Confirmed") {
    property.status = "Pending";
    property.isAvailable = true;
    await property.save();
  }

  booking.status = "Rejected";
  await booking.save();

  res.send({
    message: "Booking rejected successfully",
    booking,
    property,
  });
}




async function cancelBooking(req, res) {
  const { buyer } = req.body;
  const { id } = req.params;

  if (!buyer || !id) {
    res.send({ message: "Booking ID and buyer ID are required" });
    return;
  }

  const booking = await Booking.findOne({
    _id: id,
    buyer: buyer,
  });

  if (!booking) {
    res.send({ message: "Booking not found or unauthorized" });
    return;
  }

  if (booking.status === "Cancelled") {
    res.send({ message: "Booking is already cancelled" });
    return;
  }

  if (booking.status === "Rejected") {
    res.send({ message: "Rejected bookings cannot be cancelled" });
    return;
  }

  if (booking.status === "Confirmed") {
    const property = await Property.findOne({
      _id: booking.property,
      listedBy: booking.seller,
    });

    if (property) {
      property.status = "Pending";
      property.isAvailable = true;
      await property.save();
    }
  }

  booking.status = "Cancelled";
  await booking.save();

  res.send({
    message: "Booking cancelled successfully",
    booking,
  });
}



module.exports = {
  addBooking,
  getBookings,
  getBookingById,
  getBookingsByBuyer,
  getBookingsBySeller,
  deleteBooking,
  updateBookingStatus,
  cancelBooking,
};
