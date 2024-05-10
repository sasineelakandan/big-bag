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
    
    const items=[]
    for(i=0;i<card.length;i++){
        items.push({
            'name':card[i].productName,
            'price':card[i].productprice,
            'currency':'USD',
            'quantity':card[i].productQuantity
            
        })
    }

    const total=card.reduce((acc,val)=>acc+val.totalCostPerProduct ,0)
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
        'transactions': [{ // Change made here: transactions instead of transaction
            'item_list': {
                'items': items
            },
            'amount': {
                'currency': 'USD',
                'total': total
            }
        }]
    };
    

   paypal.payment.create(create_payment_json,async function(error,payment){
        if(error){
            throw error;
        }else{
            
                   
                
               
              req.session.paymentId=payment.id
            
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

     
     const WalletOrder=  await orderCollection?.find({paymentType:'Online Payment',orderStatus:'cancel'}).sort({_id:-1})
     console.log(WalletOrder)
     
     if(WalletOrder.length==0){
        res.render('userpages/Wallet',{userLogged:req.session.logged}) 
     }
      const a=WalletOrder.cartData
    for(i=0;i<WalletOrder.length;i++){
        const total=WalletOrder.reduce((acc,val)=>acc+val.Total ,0)
    if(WalletOrder[i]?.orderStatus=='cancel'){
     
        var totalamount=WalletOrder[i].Total
        const walletin= await walletCollection.updateOne({userId:req.query.id},{$set:{
          userId:req.query.id,
          walletBalance: total,
          transactionsDate:new Date(),
          transactionsId:WalletOrder[i].paymentId,
          transactionsMethod:'Online payment'

       }},{upsert:true},{new:true})
         
       const wallet=await walletCollection.findOne({userId:req.query.id})

       res.render('userpages/Wallet',{userLogged:req.session.logged,walletDet:wallet,orderDet:WalletOrder})
        }
   
    }
    }catch(error){
        console.log(error)
    }
}
module.exports={paymentPage,Wallet}