const usercollection = require('../model/usermodel')
const otpcollections = require('../model/otpmodel')
const categorycollection = require('../model/categorymodel')
const productcollection = require("../model/productmodel")
const productOfferCollection=require('../model/ProductOffer')
const categoryOfferCollection=require('../model/categoryOffer')

const categoryOfferget=async(req,res)=>{
    try{
       const category2=await categoryOfferCollection?.find()
       let categoryOffer=[]
       for(i=0;i<category2?.length;i++){
        categoryOffer.push(await categorycollection.find({_id:category2[i].category}))
        
       }
       
       const categorydet=categoryOffer.flat()
       const category=await categorycollection.find()
        res.render('adminpages/categoryOffer',{categoryDet:category,categoryOfferDet:category2,categoryDet2:categorydet})
    }catch(error){
        console.log(error)
    }
}
const categoryofferDet=async(req,res)=>{
    try{
        const offer1= await categoryOfferCollection?.findOne({category:req.body.categoryId})
        if(offer1){
            console.log('hai')
            res.send({success:false})
        }else{
        const categoryOffer=new categoryOfferCollection({
            category:req.body.categoryId,
            offerPercentage:Number(req.body.offerPercentage),
            startDate:new Date(req.body.startDate),
            endDate:new Date(req.body.expiryDate)
        })
        categoryOffer.save()
     
    
        res.send({success:true})
    }
}
    catch(error){
        console.log(error)
    }

}
const categoryOffereditget=async(req,res)=>{
    try{
       const offerDet= await categoryOfferCollection.findOne({_id:req.query.id})
      res.render('adminpages/categoryOffereditpage',{OfferDet:offerDet})
    }
    catch(error){
        console.log(error)
    }
}
const categoryOfferedit=async(req,res)=>{
    try{
        
          
        
        const productOffer=await categoryOfferCollection.updateOne({category:req.body.categoryId},{$set:{
           
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
const categoryOfferExpiry = async (req, res) => {
    try {
        const currentDate = new Date();
        console.log(currentDate.getTime())
        const expiry = await categoryOfferCollection.find({isAvailable:true});
        for (let i = 0; i < expiry.length; i++) {
            const endDate = new Date(expiry[i].endDate); // Ensure endDate is a Date object
            console.log(endDate.getTime())
            if (currentDate.getTime() >= endDate.getTime()) { // Compare time in milliseconds
                
                await categoryOfferCollection.updateOne({ _id: expiry[i]._id }, { $set: { isAvailable: false } });
                const product = await productcollection.find({ parentCategory: expiry[i].category }); // Use findOne instead of find
                if (product) {
                    await productcollection.updateOne({ _id: product[i]._id }, { $set: {productPrice: product[i].priceBeforeOffer } });
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
};

module.exports={categoryOfferget,categoryofferDet,categoryOfferedit,categoryOfferExpiry,categoryOffereditget}