const mongoose = require("mongoose");

const categoryOfferSchema = new mongoose.Schema({
  category: {
    type:String,
    ref:"category",
    required: true,
  },
  categoryname: {
    type:String,
   
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
  offerPercentage: {
    type: Number,
    requierd: true,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("categoryOffer", categoryOfferSchema);