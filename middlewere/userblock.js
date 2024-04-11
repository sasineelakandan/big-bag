
const userCollection = require("../model/usermodel");

module.exports = async (req, res, next) => {
  try {
   const user=await userCollection.findOne({_id:req.session?.logged?._id})
    if(user?.isBlocked){
   req.session.logged=false
   res.redirect('/')
   


  }else{

   next()


  }


  } catch (error) {
    console.error(error)
  }
}
