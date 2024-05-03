const mongoose = require("mongoose");


const whislistSchema= new mongoose.Schema({
    userId: { type: mongoose.Types.ObjectId, required: true, ref: "users" },
    productId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "products",
      },
    Whishlist:{ type: Boolean, default: false }
})
module.exports=mongoose.model('whishlist',whislistSchema)