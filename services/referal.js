const usercollection = require('../model/usermodel')
const otpcollections = require('../model/otpmodel')
const walletCollection=require('../model/Walletmodel')


const Referal= async(referalCode,Newuser)=>{
    try{
       const referalUser= await usercollection?.findOne({ReferalCode:referalCode})
       
       if(referalUser){
         const update=await usercollection.updateOne({_id:referalUser._id},{$inc:{walletBalance:+100}})
         const update2=await usercollection.updateOne({email:Newuser},{$inc:{walletBalance:+100}})
         const user=await usercollection.findOne({email:Newuser})
         const wallet= new walletCollection({
            userId:user._id,
            walletBalance :user.walletBalance,
            transactionsDate:new Date(),
            transactiontype:'credited'
         })
         wallet.save()
         
       }
    }
    catch(error){
       console.log(error)
    }
}

module.exports={Referal}