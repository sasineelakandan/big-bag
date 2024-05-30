
const usercollection = require('../model/usermodel')
const otpcollections = require('../model/otpmodel')
const categorycollection = require('../model/categorymodel')
const productcollection = require("../model/productmodel")
const productOfferCollection=require('../model/ProductOffer')
const categoryOfferCollection=require('../model/categoryOffer')
const AppError=require('../middlewere/errorhandling')
const categoryOfferget=async(req,res,next)=>{
    try{
       const category2=await categoryOfferCollection?.find({isAvailable:true})
       let categoryOffer=[]
       for(i=0;i<category2?.length;i++){
        categoryOffer.push(await categorycollection.find({_id:category2[i].category}))
        
       }
       
       let categorydet=categoryOffer.flat()
       const category=await categorycollection.find()
       const productsPerPage = 10
        const totalPages = categorydet.length / productsPerPage
        const pageNo = req.query.pages || 1
        const start = (pageNo - 1) * productsPerPage
        const end = start + productsPerPage
        categorydet = categorydet.slice(start, end)
        res.render('adminpages/categoryOffer',{categoryDet:category,categoryOfferDet:category2,categoryDet2:categorydet,totalPages})
    }catch(error){
        next(new AppError('Somthing went Wrong', 500));
    }
}
const categoryofferDet=async(req,res,next)=>{
    try{
    
        const offer1= await categoryOfferCollection?.findOne({categoryname:{ $regex: new RegExp('^' + req.body.categoryname + '$', 'i')}})
        if(offer1){
        
            res.send({success:false})

        }else{
           const cat=await categorycollection.findOne({categoryname:req.body.categoryname})
           
        const categoryOffer=new categoryOfferCollection({
            category:cat._id,
            categoryname:cat.categoryname,
            offerPercentage:Number(req.body.offerPercentage),
            startDate:new Date(req.body.startDate),
            endDate:new Date(req.body.expiryDate)
        })
        categoryOffer.save()
     
    
        res.send({success:true})
    }
}
    catch(error){
        next(new AppError('Somthing went Wrong', 500));
    }

}
const categoryOffereditget=async(req,res,next)=>{
    try{
        const categoryname=await categorycollection.findOne({categoryname:req.query.cn})
       const offerDet= await categoryOfferCollection.findOne({_id:req.query.id})
      res.render('adminpages/categoryOffereditpage',{OfferDet:offerDet,catName:categoryname})
    }
    catch(error){
        next(new AppError('Somthing went Wrong', 500));
    }
}
const categoryOfferedit=async(req,res,next)=>{
    try{
        console.log(req.body.offerid)
          
    
        const productOffer=await categoryOfferCollection.updateOne({_id:req.body.offerid},{$set:{
            categoryname:req.body.categoryname,
            offerPercentage:Number(req.body.offerPercentage),
            startDate:new Date(req.body.startDate),
            endDate:new Date(req.body.expiryDate),
            isAvailable:true,
        }})
        
        
        res.send({success:true})
        
    
}
    
    catch(error){
        next(new AppError('Somthing went Wrong', 500));
    }
}
const categoryOfferExpiry = async (req, res,next) => {
    try {
        const currentDate = new Date();
        
        const expiry = await categoryOfferCollection.find({isAvailable:true});
        for (let i = 0; i < expiry.length; i++) {
            const endDate = new Date(expiry[i].endDate); // Ensure endDate is a Date object
            
            if (currentDate.getTime() >= endDate.getTime()) { // Compare time in milliseconds
                
                await categoryOfferCollection.updateOne({ _id: expiry[i]._id }, { $set: { isAvailable: false } });
                const product = await productcollection.find({ parentCategory: expiry[i].category }); // Use findOne instead of find
                if (product) {
                 for (let j=0;i<product.length;j++){
                    await productcollection.updateOne({ _id: product[j]._id }, { $set: {productPrice: product[j].priceBeforeOffer ,productOfferPercentage:0} });
                }
                }
            }
        }
    } catch (error) {
        next(new AppError('Somthing went Wrong', 500));
    }
};
const catOffDel=async(req,res,next)=>{
    try{
        console.log(req.query.id)
        const expiry = await categoryOfferCollection.find({_id:req.query.id});
        for (let i = 0; i < expiry.length; i++) {
            
            
            
                
                await categoryOfferCollection.updateOne({ _id: expiry[i]._id }, { $set: { isAvailable: false } });
                const product = await productcollection.find({ parentCategory: expiry[i].category });
                 
                if (product) {
                 for (let j=0;j<product.length;j++){
                    await productcollection.updateOne({ _id: product[j]._id }, { $set: {productPrice: product[j].priceBeforeOffer ,productOfferPercentage:0} });
                }
                }
            
        }
       const update=await categoryOfferCollection.deleteOne({_id:req.query.id})
       res.send({del:true})
       
    }
    catch(error){
        next(new AppError('Somthing went Wrong', 500));
    }
}

module.exports={categoryOfferget,categoryofferDet,categoryOfferedit,categoryOfferExpiry,categoryOffereditget,catOffDel}
