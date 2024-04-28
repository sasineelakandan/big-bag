const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "users",
    },
    orderDate: { type: Date, default: Date.now },
    paymentType: { type: String, required: true },
    orderStatus: { type: String, required: true, default: "Pending" },
    address: {
      type:String,
      required: true,
      ref: "addresses",
    },
    cartData: { type: Array, required: true },
    Items:{type: Number, required: true},
    grandTotalCost: { type: Number, required: true },
    paymentId: { type: String, default: null },
    Gst:{type: Number, required: true},
    Scharge:{type: Number, required: true},
    Total:{type: Number, required: true},
    couponApplied: {
      type: mongoose.Types.ObjectId,
      default: null,
      ref: "coupons",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("orders", orderSchema);