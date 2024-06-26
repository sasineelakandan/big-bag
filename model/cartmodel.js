
const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Types.ObjectId, required: true, ref: "users" },
    productId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "products",
    },
    productImage: {type: String} ,
    Status:{type:String},
    productQuantity: { type: Number, required: true, default: 1, min: 1 },
    totalCostPerProduct: { type: Number },
    productName:{type:String},
    productprice:{ type: Number },
    priceBeforeOffer :{type:Number},
    productOfferPercentage:{type:Number},
  },
  { strictPopulate: false }
);

const cartCollection = mongoose.model("carts", cartSchema);

module.exports = cartCollection;
