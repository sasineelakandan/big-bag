const usercollection = require('../model/usermodel')
const otpcollections = require('../model/otpmodel')
const categorycollection = require('../model/categorymodel')
const productcollection = require("../model/productmodel")
const productOfferCollection=require('../model/ProductOffer')

const productOfferget=async(req,res)=>{
    try{
       const offers= await productOfferCollection.find({}).sort({_id:-1})
       
       

       
       const productDetails=await productcollection.find({})
      
        res.render('adminpages/productOffer',{OfferDet:offers,productDet:productDetails})
    }
    catch(error){
        console.log(error)
    }

}
const productofferDet=async(req,res)=>{
    try{
        
        const offer1= await productOfferCollection?.findOne({productName:req.body.productId})
        if(offer1){
            
            res.send({success:false})
        }else{
         const product =await productcollection.findOne({productName:req.body.productId})
        const productOffer=new productOfferCollection({
            product:product._id,
            productName:req.body.productId,
            offerPercentage:req.body.offerPercentage,
            startDate:new Date(req.body.startDate),
            endDate:new Date(req.body.expiryDate)
        })
        productOffer.save()
    
        res.send({success:true})
    }
}
    catch(error){
        console.log(error)
    }
}
const productofferEdit=async(req,res)=>{
    try{
         console.log(req.body)
        const product=await productcollection.findOne({productName:req.body.categoryname})
        
        const productOffer=await productOfferCollection.updateOne({_id:req.body.offerid},{$set:{
            productName:req.body.categoryname,
            offerPercentage:Number(req.body.offerPercentage),
            startDate:new Date(req.body.startDate),
            endDate:new Date(req.body.expiryDate)
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
        const offerdet2=await productcollection.findOne( {productName: { $regex: new RegExp('^' + req.body.pn + '$', 'i') }})
       res.render('adminpages/productOffereditpage',{OfferDet:offerDet,Offerdet2:offerdet2})
     }
     catch(error){
         console.log(error)
     }
}

const ProductDel=async(req,res)=>{
    try{
        const update=await productOfferCollection.updateOne({_id:req.query.id},{$set:{isAvailable:false}})
        res.redirect('/productOffer')
    }
    catch(error){
        console.log(error)
    }
}


const productOfferExpiry = async (req, res) => {
    try {
        const currentDate = new Date();
        
        const expiry = await productOfferCollection.find({isAvailable:true});
        for (let i = 0; i < expiry.length; i++) {
            const endDate = new Date(expiry[i].endDate); // Ensure endDate is a Date object
            console.log(endDate.getTime())
            if (currentDate.getTime() >= endDate.getTime()) { // Compare time in milliseconds
                console.log('hai')
                await productOfferCollection.updateOne({ _id: expiry[i]._id }, { $set: { isAvailable: false } });
                const product = await productcollection.findOne({ _id: expiry[i].product }); // Use findOne instead of find
                if (product) {
                    await productcollection.updateOne({ _id: expiry[i].product }, { $set: {productPrice: product.priceBeforeOffer } });
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
};


module.exports={productOfferget,productofferDet,productofferEdit,productOfferExpiry,productEditpageget,ProductDel}
