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
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "addresses",
    },
    cartData: { type: Array, required: true },
    Items:{type: Number, required: true},
    grandTotalCost: { type: Number, required: true },
    paymentId: { type: String, default: null },
    UserName:{ type: String,required:true},
    OrderId:{type: Number, required: true},
    Total:{type: Number, required: true},
    couponApplied: {
      type: Number,
      default: null,
      ref: "coupons",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("orders", orderSchema);