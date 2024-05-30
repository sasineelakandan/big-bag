const categorycollection = require('../model/categorymodel')
const productcollection = require("../model/productmodel")
const productOfferCollection=require('../model/ProductOffer')
const categoryOfferCollection=require('../model/categoryOffer')
const couPonCollection=require('../model/Couponmodel')
const AppError=require('../middlewere/errorhandling')

const Couponget=async(req,res,next)=>{
    try{
        let coupons=await couPonCollection.find({isDelete:false})
        const productsPerPage = 10
       const totalPages = coupons.length / productsPerPage
       const pageNo = req.query.pages || 1
       const start = (pageNo - 1) * productsPerPage
       const end = start + productsPerPage
       coupons = coupons.slice(start, end)
        res.render('adminpages/Coupon',{userLogged:req.session.logged,couponDet:coupons,totalPages})
    }
    catch(error){
        next(new AppError('Somthing went Wrong', 500))
    }
}
const CouponEditget=async(req,res,next)=>{
    try{
        const coupons=await couPonCollection.findOne({_id:req.query.id})
        res.render('adminpages/couponEditpage',{userLogged:req.session.logged,couponDet:coupons})
    }
    catch(error){
        next(new AppError('Somthing went Wrong', 500));
    }
}
const CouponOffDet=async(req,res,next)=>{

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
        next(new AppError('Somthing went Wrong', 500));
    }
}
const CouponOffEdit=async(req,res,next)=>{
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
        next(new AppError('Somthing went Wrong', 500));
    }
    
}
const couponDelete=async(req,res,next)=>{
    try{
    const update=  await couPonCollection.updateOne({_id:req.query.id},{$set:{isDelete:true}})
      res.send({del:true})
    }
    catch(error){
        next(new AppError('Somthing went Wrong', 500));
    }
}

module.exports={Couponget,CouponOffDet,CouponOffEdit,CouponEditget,couponDelete}