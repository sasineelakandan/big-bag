const mongoose = require("mongoose");

const productOfferSchema = new mongoose.Schema({
  product: {
    type: String,
    ref: "Product",
    required: true,
  },
  productName: {
    type: String,
    ref: "Product",
    required: true,
  },
  offerPercentage: {
    type: Number,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("ProductOffer", productOfferSchema);