const usercollection = require('../model/usermodel')
const otpcollections = require('../model/otpmodel')
const walletCollection=require('../model/Walletmodel')


const Referal= async(referalCode,Newuser)=>{
    try{
      
     console.log(referalCode)
       
       const referalUser= await usercollection?.findOne({ReferalCode:referalCode})
       if(referalUser){
         const update=await usercollection.updateOne({_id:referalUser._id},{$inc:{walletBalance:+100}})
         const wallet1= new walletCollection({
            userId:referalUser._id,
            walletBalance :100,
            PaymentType:'Bonus',
            transactionsDate:new Date(),
            transactiontype:'credited'
         })
         wallet1.save()
         const update2=await usercollection.updateOne({email:Newuser},{$inc:{walletBalance:+100}})
       
         const user=await usercollection.findOne({email:Newuser})
         
        
       
         const wallet= new walletCollection({
            userId:user._id,
            walletBalance :user.walletBalance,
            PaymentType:'Bonus',
            transactionsDate:new Date(),
            transactiontype:'credited'
         })
         wallet.save()
        
       }else{
         alert('you miss 100$ referal bonus')
       }
    }
    catch(error){
       console.log(error)
    }
}

module.exports={Referal}