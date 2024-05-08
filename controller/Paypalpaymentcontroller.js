const paypal=require('paypal-rest-sdk')
const userCollection = require('../model/usermodel')
const otpCollections = require('../model/otpmodel')
const categoryCollection = require('../model/categorymodel')
const productCollection = require("../model/productmodel")
const cartCollection=require('../model/cartmodel')
const orderCollection=require('../model/ordermodel')
const addressCollection=require('../model/addressmodel')

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
            
                const usercart=await cartCollection.find({userId:req.query.id})
                var count=0
                for(let i=0;i<usercart?.length;i++){
                 var cartData=usercart[i]?._id
                    count++
                }
               
              
            
                for (let i = 0; i < usercart?.length; i++) {
                  await productCollection.updateOne(
                    { _id: usercart[i].productId },
                    { $inc: { productStock: -usercart[i].productQuantity } }
                  );
                }
                const add =await addressCollection.findOne({userId:req.query.id})
                await cartCollection.deleteMany({userId:req.query.id})
        
                const newOrder = new orderCollection({
                  userId:req.query.id,
                  paymentType:'Online Payment',
                  paymentId:payment.id,
                  address:add.id,
                  grandTotalCost:total,
                  cartData:usercart,
                  Items:count,
                 
                
                  Total:total
              })
              newOrder.save()
            
              
                 
                
                 
              }
              
            console.log(payment)
            for(let i=0;payment.links.length;i++){
                if(payment.links[i].rel==='approval_url'){
                   return res.redirect(payment.links[i].href)
                }
            }
        }
   )
}
catch(error){
    console.log(error)
}

}
module.exports={paymentPage}