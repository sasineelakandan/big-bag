const categorycollection = require('../model/categorymodel')
const productcollection = require("../model/productmodel")
const productOfferCollection=require('../model/ProductOffer')
const categoryOfferCollection=require('../model/categoryOffer')
const couPonCollection=require('../model/Couponmodel')


const Couponget=async(req,res)=>{
    try{
        const coupons=await couPonCollection.find({isDelete:false})
        res.render('adminpages/Coupon',{userLogged:req.session.logged,couponDet:coupons})
    }
    catch(error){
        console.log(error)
    }
}
const CouponEditget=async(req,res)=>{
    try{
        const coupons=await couPonCollection.findOne({_id:req.query.id})
        res.render('adminpages/couponEditpage',{userLogged:req.session.logged,couponDet:coupons})
    }
    catch(error){
        console.log(error)
    }
}
const CouponOffDet=async(req,res)=>{

    try{
        console.log(req.body)
        const coupons=await couPonCollection?.findOne({couponCode:{ $regex: new RegExp('^' + req.body.name + '$', 'i')}})
        if(coupons){
            res.send({success:false})
        }else{
       const coupon= new couPonCollection({
        couponCode:req.body.name,
        discountPercentage:req.body.offerPrice,
        startDate:req.body.startDate,
        expiryDate:req.body.expiryDate,
        minimumPurchase:req.body.minimumPurchase
       })
       coupon.save()
       res.send({success:true})
    }
}
    catch(error){
        console.log(error)
    }
}
const CouponOffEdit=async(req,res)=>{
    try{
         
    const update=await couPonCollection.updateOne({_id:req.body.offerid},{$set:{
        couponCode:req.body.categoryname,
        discountPercentage:req.body.offerPrice,
        startDate:req.body.startDate,
        expiryDate:req.body.expiryDate,
        minimumPurchase:req.body.MinimumPurchase
    }})
    res.send({success:true})
    }
    catch(error){
        console.log(error)
    }
    
}
const couponDelete=async(req,res)=>{
    try{
    const update=  await couPonCollection.updateOne({_id:req.query.id},{$set:{isDelete:true}})
      res.redirect('/coupons')
    }
    catch(error){
        console.log(error)
    }
}

module.exports={Couponget,CouponOffDet,CouponOffEdit,CouponEditget,couponDelete}