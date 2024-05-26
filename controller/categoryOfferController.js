
const usercollection = require('../model/usermodel')
const otpcollections = require('../model/otpmodel')
const categorycollection = require('../model/categorymodel')
const productcollection = require("../model/productmodel")
const productOfferCollection=require('../model/ProductOffer')
const categoryOfferCollection=require('../model/categoryOffer')

const categoryOfferget=async(req,res)=>{
    try{
       const category2=await categoryOfferCollection?.find({isAvailable:true})
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
        console.log(error)
    }

}
const categoryOffereditget=async(req,res)=>{
    try{
        const categoryname=await categorycollection.findOne({categoryname:req.query.cn})
       const offerDet= await categoryOfferCollection.findOne({_id:req.query.id})
      res.render('adminpages/categoryOffereditpage',{OfferDet:offerDet,catName:categoryname})
    }
    catch(error){
        console.log(error)
    }
}
const categoryOfferedit=async(req,res)=>{
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
        console.log(error)
    }
}
const categoryOfferExpiry = async (req, res) => {
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
        console.log(error);
    }
};
const catOffDel=async(req,res)=>{
    try{
       const update=await categoryOfferCollection.deleteOne({_id:req.query.id})
       res.redirect('/categoryOffer')
    }
    catch(error){
        console.log(error)
    }
}

module.exports={categoryOfferget,categoryofferDet,categoryOfferedit,categoryOfferExpiry,categoryOffereditget,catOffDel}
