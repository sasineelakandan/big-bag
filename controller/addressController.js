const productCollection=require('../model/productmodel')
const categoryCollection=require('../model/categorymodel')
const addressCollection=require('../model/addressmodel')
const usercollection=require('../model/usermodel')
const bcrypt = require('bcryptjs')
const AppError=require('../middlewere/errorhandling')


const account=async(req,res,next)=>{
    try{
        if(req.session.logged){
        res.render('userpages/account',{userLogged:req.session.logged,password:'******'})
    }else{
        res.render('userpages/login',{userLogged:null})
    }
  }
    catch(error){
        next(new AppError('Somthing went Wrong', 500));
    }
}
const addaddress=async(req,res,next)=>{
try{
    if(req.session.logged){
        res.render('userpages/addaddress',{userLogged:req.session.logged})
        

        
    }else{
        res.render('userpages/addaddress',{userLogged:null})
    }
}
catch(error){
    next(new AppError('Somthing went Wrong', 500));
}
}
const addaddress2=async(req,res,next)=>{

    try{
        
       const address= new addressCollection({
        userId:req.session.logged?._id,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phone:req.body.phoneNumber,
        addressTitle: req.body.addressTitle,
        addressLine1: req.body.address1,
        addressLine2: req.body. address2,
        City:req.body.City,
        State:req.body.State

      })
    await address.save()
    res.status(200).send({ success: true })
    }
   
    catch(error){
        next(new AppError('Somthing went Wrong', 500));
    }
}
const Myaddress=async(req,res,next)=>{
    try{
        
        
         const address=await addressCollection.find({userId:req.session.logged._id})
         
        res.render('userpages/myaddress',{userLogged:req.session.logged,addressDet:address})
    
    }

    catch(error){
        next(new AppError('Somthing went Wrong', 500));
    }
}
const editAdd=async(req,res,next)=>{
    try{
        
        if(req.params.id){
        const address=await addressCollection.findOne({_id:req.params.id})
        
        res.render('userpages/editadd',{userLogged:req.session.logged,addressDet:address})
    }
}
    catch(error){
        next(new AppError('Somthing went Wrong', 500));
    }
}
const updateAdd=async(req,res,next)=>{
    try{
        
    const updateAdd=await addressCollection.updateOne({_id:req.body.addressId},{$set:{
        firstName: req.body.firstName,
        lastName : req.body.lastName,
        phone:req.body.phoneNumber,
        addressTitle:req.body.addressTitle,
        addressLine1:req.body.address2,
        addressLine2:req.body.address2,
        City:req.body.City,
        State:req.body.State
    }})
    res.send({ success: true });
    }
    catch(error){
        next(new AppError('Somthing went Wrong', 500));
    }
}
const deleteAdd=async(req,res,next)=>{
    try{ 
        await addressCollection.deleteOne({_id:req.session.logged._id})
         res.redirect('//myaddress')
       
    }
    catch(error){
        next(new AppError('Somthing went Wrong', 500));
    }
}
const updatePro=async(req,res,next)=>{
    try{
        const user=await usercollection.findOne({_id:req.body.userId})
        
        const passwordMatch = await bcrypt.compare(req.body.password, user.password)
        
        if(passwordMatch){
            const bcryptpassword = await bcrypt.hash(req.body.confirm_password, 10)
           newpassword =await usercollection.updateOne({_id:req.body.userId},{$set:{
                name:req.body.name,
                phone:req.body.phone,
                password:bcryptpassword}})
                req.session.logged.name=req.body.name
                res.send({success:true})
                
            
        }else{
                newpassword =await usercollection.updateOne({_id:req.body.userId},{$set:{
                name:req.body.name,
                phone:req.body.phone,}})
                req.session.logged.name=req.body.name
                res.send({success:true})
                
            
        }
    }
    catch(error){
        next(new AppError('Somthing went Wrong', 500));
    }
}
module.exports={account,addaddress,addaddress2,Myaddress,editAdd,updateAdd,deleteAdd,updatePro}