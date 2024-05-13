const usercollection = require('../model/usermodel')
const otpcollections = require('../model/otpmodel')
const categorycollection = require('../model/categorymodel')
const productcollection = require("../model/productmodel")
const productOfferCollection=require('../model/ProductOffer')

const productOfferget=async(req,res)=>{
    try{
       const offers= await productOfferCollection.find({}).sort({_id:-1})
       
       var productDetails1=[]

       for(i=0;i<offers.length;i++){
          productDetails1.push(await productcollection.find({_id:offers[i].product}))
        
       }
       const productDetails=await productcollection.find({})
      const productDetails2 =productDetails1.flat()
        res.render('adminpages/productOffer',{productDet:productDetails,OfferDet:offers,productDet2:productDetails2})
    }
    catch(error){
        console.log(error)
    }

}
const productofferDet=async(req,res)=>{
    try{
        const offer1= await productOfferCollection?.findOne({product:req.body.productId})
        if(offer1){
            console.log('hai')
            res.send({success:false})
        }else{
  
        const productOffer=new productOfferCollection({
            product:req.body.productId,
            offerPercentage:req.body.offerPercentage,
            startDate:new Date(req.body.startDate),
            endDate:new Date(req.body.expiryDate)
        })
        productOffer.save()
        const product=await productcollection.findOne({_id:req.body.productId})
        const offer= await productOfferCollection.findOne({product:req.body.productId})
        const b=Number(offer.offerPercentage)
        
        const pprice=product.productPrice
        const a=Math.floor(pprice*b)/100
       const offerPrice=pprice-a
         const update= await productcollection.updateOne({_id:req.body.productId},{$set:{
            productOfferId:offer._id,
            productOfferPercentage:b,
            priceBeforeOffer:offerPrice
         }})
        res.send({success:true})
    }
}
    catch(error){
        console.log(error)
    }
}
const productofferEdit=async(req,res)=>{
    try{
        
        const productOffer=await productOfferCollection.updateOne({product:req.body.productId},{$set:{
           
            offerPercentage:Number(req.body.offerPercentage),
            startDate:new Date(req.body.startDate),
            endDate:new Date(req.body.expiryDate)
        }})
        const product=await productcollection.findOne({_id:req.body.productId})
        const offer= await productOfferCollection.findOne({product:req.body.productId})
        const b=Number(offer.offerPercentage)
        
        const pprice=product.productPrice
        const a=Math.floor(pprice*b)/100
       const offerPrice=pprice-a
         const update= await productcollection.updateOne({_id:req.body.productId},{$set:{
            productOfferId:offer._id,
            productOfferPercentage:b,
            priceBeforeOffer:offerPrice
         }})
         
        res.send({success:true})
    }
    catch(error){
        console.log(error)
    }

}
const productEditpageget=async(req,res)=>{
    try{
        const offerDet= await productOfferCollection.findOne({_id:req.query.id})
       res.render('adminpages/productOffereditpage',{OfferDet:offerDet})
     }
     catch(error){
         console.log(error)
     }
}
const productOfferExpiry = async (req, res) => {
    try {
        const currentDate = new Date();
        console.log(currentDate.getTime())
        const expiry = await productOfferCollection.find({isAvailable:true});
        for (let i = 0; i < expiry.length; i++) {
            const endDate = new Date(expiry[i].endDate); // Ensure endDate is a Date object
            console.log(endDate.getTime())
            if (currentDate.getTime() >= endDate.getTime()) { // Compare time in milliseconds
                console.log('hai')
                await productOfferCollection.updateOne({ _id: expiry[i]._id }, { $set: { isAvailable: false } });
                const product = await productcollection.findOne({ _id: expiry[i].product }); // Use findOne instead of find
                if (product) {
                    await productcollection.updateOne({ _id: expiry[i].product }, { $set: { priceBeforeOffer: product.productPrice } });
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
};


module.exports={productOfferget,productofferDet,productofferEdit,productOfferExpiry,productEditpageget}
