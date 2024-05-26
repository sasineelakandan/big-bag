const mongoose= require('mongoose')

const couponSchema= new mongoose.Schema({
    couponCode: { type: String, required: true },
    discountPercentage: { type: Number, min: 5, max: 100, required: true},
    startDate: { type: Date, required: true, default: new Date().toLocaleString() },
    expiryDate: { type: Date, required: true },
    minimumPurchase: { type: Number, required: true },
    isAvailaple:{type:Boolean,default:false},
    isDelete:{type:Boolean,default:false},
})

module.exports=  mongoose.model('coupons', couponSchema )

