const mongoose=require('mongoose')

const category=new mongoose.Schema({
   categoryname:{
        type:String,
        required:true
   },
   categorydescription:{
        type:String,
        required:true
   },
   isListed:{
    type:Boolean,
    default:true,
   }

})

module.exports=mongoose.model('category',category)