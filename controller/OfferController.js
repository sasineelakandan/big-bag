const usercollection = require('../model/usermodel')
const otpcollections = require('../model/otpmodel')
const categorycollection = require('../model/categorymodel')
const productcollection = require("../model/productmodel")
const productOfferCollection=require('../model/ProductOffer')
const AppError=require('../middlewere/errorhandling')
const productOfferget=async(req,res,next)=>{
    try{
       const offers= await productOfferCollection.find({}).sort({_id:-1})
       
       

       
       let productDetails=await productcollection.find({})
       const productsPerPage = 10
       const totalPages = productDetails.length / productsPerPage
       const pageNo = req.query.pages || 1
       const start = (pageNo - 1) * productsPerPage
       const end = start + productsPerPage
       productDetails = productDetails.slice(start, end)
        res.render('adminpages/productOffer',{OfferDet:offers,productDet:productDetails,totalPages})
    }
    catch(error){
        next(new AppError('Somthing went Wrong', 500))
    }

}
const productofferDet=async(req,res,next)=>{
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
        next(new AppError('Somthing went Wrong', 500))
    }
}
const productofferEdit=async(req,res,next)=>{
    try{
         
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
       next(new AppError('Somthing went Wrong', 500))
    }

}
const productEditpageget=async(req,res,next)=>{
    try{
        const offerDet= await productOfferCollection.findOne({_id:req.query.id})
        const offerdet2=await productcollection.findOne( {productName: { $regex: new RegExp('^' + req.body.pn + '$', 'i') }})
       res.render('adminpages/productOffereditpage',{OfferDet:offerDet,Offerdet2:offerdet2})
     }
     catch(error){
        next(new AppError('Somthing went Wrong', 500))
     }
}

const ProductDel=async(req,res,next)=>{
    try{
        
        
         const expiry = await productOfferCollection.find({_id:req.query.id})
         
         for (let i = 0; i < expiry.length; i++) {
             
             
         
                 await productOfferCollection.updateOne({ _id: expiry[i]._id }, { $set: { isAvailable: false } });
                 const product = await productcollection.findOne({ _id: expiry[i].product }); // Use findOne instead of find
                 if (product) {
                     await productcollection.updateOne({ _id: expiry[i].product }, { $set: {productPrice: product.priceBeforeOffer,productOfferPercentage:0 } });
                 }
             
         }
        
        const update=await productOfferCollection.deleteOne({_id:req.query.id})
        res.send({del:true})
    }
    catch(error){
        next(new AppError('Somthing went Wrong', 500))
    }
}


const productOfferExpiry = async (req, res,next) => {
    try {
        const currentDate = new Date();
        
        const expiry = await productOfferCollection.find({isAvailable:true});
        for (let i = 0; i < expiry.length; i++) {
            const endDate = new Date(expiry[i].endDate); // Ensure endDate is a Date object
            console.log(endDate.getTime())
            if (currentDate.getTime() >= endDate.getTime()) { // Compare time in milliseconds
        
                await productOfferCollection.updateOne({ _id: expiry[i]._id }, { $set: { isAvailable: false } });
                const product = await productcollection.findOne({ _id: expiry[i].product }); // Use findOne instead of find
                if (product) {
                    await productcollection.updateOne({ _id: expiry[i].product }, { $set: {productPrice: product.priceBeforeOffer,productOfferPercentage:0 } });
                }
            }
        }
    } catch (error) {
        next(new AppError('Somthing went Wrong', 500))
    }
};


module.exports={productOfferget,productofferDet,productofferEdit,productOfferExpiry,productEditpageget,ProductDel}
