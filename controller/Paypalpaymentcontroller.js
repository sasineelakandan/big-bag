const paypal=require('paypal-rest-sdk')
const userCollection = require('../model/usermodel')
const otpCollections = require('../model/otpmodel')
const categoryCollection = require('../model/categorymodel')
const productCollection = require("../model/productmodel")
const cartCollection=require('../model/cartmodel')
const orderCollection=require('../model/ordermodel')
const addressCollection=require('../model/addressmodel')
const walletCollection=require('../model/Walletmodel')
const AppError=require('../middlewere/errorhandling')

const { PAYPALMODE,PAYPAL_CLINT_KEY,PAYPAL_SECRET_KEY}=process.env

paypal.configure({
    'mode':PAYPALMODE,
    'client_id':PAYPAL_CLINT_KEY,
    'client_secret':PAYPAL_SECRET_KEY
})

const paymentPage=async(req,res,next)=>{
    const card=await cartCollection.find({userId:req.query.id})
    
   

    const total=req.session.grandtotal
    req.session.total=total
try{
    const create_payment_json = {
        'intent': 'sale',
        'payer': {
            'payment_method': 'paypal'
        },
        'redirect_urls': { // Change made here: redirect_urls instead of redirect_url
            'return_url': 'http://localhost:8001/checkout5',
            'cancel_url': 'http://localhost:8001/errPay'
        },
           "transactions": [{
                "item_list": {
                    "items": [{
                        "name": "book",
                        "sku": "001",
                        "price":total ,
                        "currency": "USD",
                        "quantity": 1
                    }]
                },
                "amount": {
                    "currency": "USD",
                    "total": total // Fix the total amount to 2 decimal places
                },
                "description": "This is the payment description.",

            }]
        };
    

   paypal.payment.create(create_payment_json,async function(error,payment){
        if(error){
            throw error;
        }else{
            
                   
                
               
              req.session.paymentId=payment.id
            console.log('hai')
            for(let i=0;payment.links.length;i++){
                if(payment.links[i].rel==='approval_url'){
                   
                    return res.redirect(payment.links[i].href)
                    
            }
        }
          } 
         }
        )
}

catch(error){
    next(new AppError('Somthing went Wrong', 500));
}

}
const errPage=async(req,res)=>{
    try{
        var usercart=await cartCollection.find({userId:req.session.logged._id})
        const add =await addressCollection.findOne({userId:req.session.logged._id})          
        var count=0
        for(let i=0;i<usercart?.length;i++){
         var cartData=usercart[i]?._id
            count++
        }         
                  
      
        
         
      
     
       
         
       
       
        const orderId = Math.floor(100000 + Math.random() * 900000);
        const newOrder = new orderCollection({
          OrderId:orderId,
          userId:req.session.logged._id,
          orderStatus:'PaymentPanding',
          UserName:req.session.logged.name,
          paymentType:'Online Payment',
          paymentId:req.session.paymentId,
          address:add._id,
          grandTotalCost:req.session.Sum,
          cartData:usercart,
          Items:count,
          couponApplied:req.session.copponAplied,
          UserName:req.session.logged.name,
          Total:req.session.total
      })
      newOrder.save()
      req.session.paymentId=null  
      res.render('userpages/paymenterrorpage',{userLogged:req.session.logged})
    }catch(error){
        next(new AppError('Somthing went Wrong', 500));
    }
}
const paymentPage2=async(req,res,next)=>{
    const card=await cartCollection.find({userId:req.query.id})
    
  const  user=await userCollection.findOne({_id:req.query.id})

    const total=req.session.grandtotal-user.walletBalance
    req.session.total=total
try{
    const create_payment_json = {
        'intent': 'sale',
        'payer': {
            'payment_method': 'paypal'
        },
        'redirect_urls': { // Change made here: redirect_urls instead of redirect_url
            'return_url': 'http://localhost:8001/Wallet',
            'cancel_url': 'http://localhost:8001/shop'
        },
           "transactions": [{
                "item_list": {
                    "items": [{
                        "name": "book",
                        "sku": "001",
                        "price":total ,
                        "currency": "USD",
                        "quantity": 1
                    }]
                },
                "amount": {
                    "currency": "USD",
                    "total": total // Fix the total amount to 2 decimal places
                },
                "description": "This is the payment description.",

            }]
        };
    

   paypal.payment.create(create_payment_json,async function(error,payment){
        if(error){
            throw error;
        }else{
            
                   
                
               
              
            req.session.paymentId2=payment.id
            
            for(let i=0;payment.links.length;i++){
                if(payment.links[i].rel==='approval_url'){
                    
                   
                    
                  
                    
                    return res.redirect(payment.links[i].href)
                    
            }
        }
          } 
         }
        )
}

catch(error){
    next(new AppError('Somthing went Wrong', 500));
}

}
const Wallet=async(req,res,next)=>{
    try{
         if(req.session.paymentId2){
            const  user=await userCollection.updateOne({_id:req.session.logged._id},{$inc:{walletBalance:+req.session.total}})
            const walletTransaction =new walletCollection({
                userId: req.session.logged._id,
                walletBalance:req.session.total ,
                PaymentType:'Online Amountadded',
                transactionsDate: new Date(),
                transactiontype: 'credited'
            });
            
            const saveResult = await walletTransaction.save();
            
            req.session.paymentId=null
            req.session.total=null
            const userWallet=await userCollection.findOne({_id:req.session.logged._id})
            const walletHistory=await walletCollection.find({userId:req.session.logged._id}).sort({_id:-1})
        
        res.render('userpages/Wallet',{userLogged:req.session.logged,userDet:userWallet,walletDet:walletHistory})
         }else{
        const userWallet=await userCollection.findOne({_id:req.session.logged._id})
        const walletHistory=await walletCollection.find({userId:req.session.logged._id}).sort({_id:-1})
        
        res.render('userpages/Wallet',{userLogged:req.session.logged,userDet:userWallet,walletDet:walletHistory})
         }
    
       

    }
    
       
  
   

    catch(error){
        next(new AppError(error, 500));
    }
}
module.exports={paymentPage,Wallet,paymentPage2,errPage}