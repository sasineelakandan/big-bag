const mongoose=require('mongoose')
const { Whishlist } = require('../controller/usercontroler')


const userschema=new mongoose.Schema({
    name:{
        required:true,
        type:String
    },
    email:{
        required:true,
        type:String
    },
    password:{
        required:true,
        type:String
    },
    phone:{
        required:true,
        type:Number
    },
    isBlocked:{
        required:true,
        type:Boolean,
        default:false
    },
    ReferalCode: {type: Number,required:true} ,
    failPayments:{type:Array},
    walletBalance: {type: Number,default:0}
})
module.exports=mongoose.model('user',userschema)