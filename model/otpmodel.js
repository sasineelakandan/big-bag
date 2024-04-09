const mongoose=require('mongoose')

const otpSchema=new mongoose.Schema({
    userId:{
        required:true,
        type:mongoose.Schema.Types.ObjectId,
        ref:'users'
    },
    otp:{
        required:true,
        type:String
    },
    expiryDate:{
        required:true,
        type:Date
    },
    generatedDate:{
        required:true,
        type:Date
    }

})

module.exports=mongoose.model('otp',otpSchema)