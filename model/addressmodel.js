const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Types.ObjectId, required: true, ref: "user" },
    addressTitle: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String, required: true },
    phone: { type: Number, required: true },
    City:{type:String,required:true},
    State:{type:String,required:true}
  },
  { strictPopulate: false }
);

module.exports = mongoose.model("addresses", addressSchema);

