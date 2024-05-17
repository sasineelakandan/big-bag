const paypal=require('paypal-rest-sdk')
const userCollection = require('../model/usermodel')
const otpCollections = require('../model/otpmodel')
const categoryCollection = require('../model/categorymodel')
const productCollection = require("../model/productmodel")
const cartCollection=require('../model/cartmodel')
const orderCollection=require('../model/ordermodel')
const addressCollection=require('../model/addressmodel')
const walletCollection=require('../model/Walletmodel')
const { orderStatus } = require('./orderController')

const { PAYPALMODE,PAYPAL_CLINT_KEY,PAYPAL_SECRET_KEY}=process.env

paypal.configure({
    'mode':PAYPALMODE,
    'client_id':PAYPAL_CLINT_KEY,
    'client_secret':PAYPAL_SECRET_KEY
})

const paymentPage=async(req,res)=>{
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
    console.log(error)
}

}
const Wallet=async(req,res)=>{
    try{
         
        const userWallet=await userCollection.findOne({_id:req.query.id})
        const walletHistory=await walletCollection.find({userId:req.query.id})
        
        res.render('userpages/Wallet',{userLogged:req.session.logged,userDet:userWallet,walletDet:walletHistory})
     
    
       

    }
    
       
  
   

    catch(error){
        console.log(error)
    }
}
module.exports={paymentPage,Wallet}