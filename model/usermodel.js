const mongoose=require('mongoose')


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
    }
})
module.exports=mongoose.model('user',userschema)