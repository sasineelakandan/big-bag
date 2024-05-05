const usercollection = require('../model/usermodel')
const otpcollections = require('../model/otpmodel')
const categorycollection = require('../model/categorymodel')
const productcollection = require("../model/productmodel")
const sendotp = require("../services/sendotp")
const auth=require('../middlewere/googleAuth')
const bcrypt = require('bcryptjs')
const cartCollection=require('../model/cartmodel')
const { productList } = require('./productController')


const whishlistCollection=require('../model/whishlistmodel')
const { search } = require('../routes/user route')

const home = async (req, res) => {
    try {
        const productDetails = await productcollection.find({isListed:true})
        const categoryDetails=await categorycollection.find({isListed:true})

        if (req.session.logged) {

            res.render('userpages/home', { userLogged: req.session.logged, productDetails,categoryDetails })
        } else {
            res.render('userpages/home', { userLogged: null, productDetails ,categoryDetails})
        }
    } catch (err) {
        console.log(err);
    }

}


const otppage = (req, res) => {
    try {
        if (req.session.user) {
            res.redirect('/')
        } else {
            res.render('userpages/otppage')
        }

    } catch (err) {
        console.log(err);
    }
}



const loginget = async (req, res) => {


    if (req.session.logged) {



        res.redirect('/')
    } else {
        res.render('userpages/login')
    }
}

const signupget = (req, res) => {
    try {
        if (req.session.logged) {
            res.redirect('/')
        } else {
            res.render('userpages/signup')
        }
    } catch (err) {
        console.log(err);
    }

}

const verifyotp = async (req, res) => {




    try {
        const usersOTP = await otpcollections.findOne({ userId: req.session.logged._id });


        const otpmatch = await bcrypt.compare(req.body.otp, usersOTP.otp)

        const notExpired = usersOTP.expiryDate.toISOString() > new Date().toISOString()


        if (otpmatch && notExpired) {

            await usercollection.updateOne({ _id: req.session.logged._id }, { $set: { isVerified: true } })
            req.session.user = true

            res.status(200).send({ otpverified: true })
        } else {
            res.status(200).send({ otpinvalid: true })
        }


    } catch (error) {
        console.log(error);
    }
}

const register = async (req, res) => {
    try {

        const checksignin = await usercollection.findOne({ $or: [{ email: req.body.email }, { phone: req.body.phone }] })

        if (checksignin) {
            res.status(208).send({ userExists: true })
        } else {
            res.status(200).send({ userExists: false })
        }

    } catch (err) {
        console.log(err);
    }
}

const singleProduct = async (req, res) => {
    try {
        
        const productDetails = await productcollection.findOne({ _id: req.query.id })
        const categoryDetails = await categorycollection.findOne({ _id: req.query.id })
      

           
           
            
           
        
            res.render('userpages/singleProduct', { userLogged: req.session.logged, productDet: productDetails, categoryDet: categoryDetails })
        }
    
     catch (err) {
        console.log(err);
    }
}

const userRegister = async (req, res) => {





    try {
        const bcryptpassword = await bcrypt.hash(req.body.password, 10)
        const user = new usercollection({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            password: bcryptpassword,
        })
        await user.save()


        if (req.query.otp) {
            req.session.logged = await usercollection.findOne({ email: req.body.email })

            const genratedotp = Math.floor(100000 + Math.random() * 900000).toString()
            await sendotp(req.session.logged, genratedotp)
            const bcryptotp = bcrypt.hashSync(genratedotp, 10)
            const userotp = new otpcollections({
                userId: req.session.logged._id,
                otp: bcryptotp,
                generatedDate: new Date().toISOString(),
                expiryDate: new Date(Date.now() + 60000).toISOString()
            })
            await userotp.save()



        }
        res.status(200).send({ userSaved: true })
    }
    catch (error) {
        console.log(`THIS IS THE ERROR IN SIGN UP : ${error}`);
    }
}

const logionverify = async (req, res) => {

    try {
        const user = await usercollection.findOne({ email: req.body.email })

        if (user?.isBlocked) {
            req.session.logged = false
            res.send({ blocked: true })
        }
        else if (user == null || user == undefined) {

            res.send({ blocked: true })
        }
        else {

            const passwordMatch = await bcrypt.compare(req.body.password, user.password)
            if (passwordMatch) {
                req.session.logged = user
                res.send({ success: true })
            } else {
                res.send({ invalidPass: true })
            }
        }


    } catch (err) {
        console.log(err);
    }
}




const resendotp = async (req, res) => {
    try {

        const generatedotp = Math.floor(100000 + Math.random() * 900000).toString()
        await sendotp(req.session.logged, generatedotp)
        const bycryptotp = bcrypt.hashSync(generatedotp, 10)
        await otpcollections.updateOne({ userId: req.session.logged._id }, { $set: { otp: bycryptotp, generatedDate: new Date().toISOString(), expiryDate: new Date(Date.now() + 60000).toISOString() } })

        res.status(200).send({ otpsend: true })
    } catch (err) {
        console.log(err);
    }
}
const shopPage = async (req, res) => {

    try {

        let categoryDetails= await categorycollection.find({isListed:true})
        
        
       
         let products;
        var count;
        let page = Number(req.query.pages) || 1;
        
        var limit = 3;
        let skip = (page - 1) * limit;
        
        count = await productcollection.find({isListed:true,isDelete:false}).countDocuments()
       
        products = await productcollection.find({isListed:true,isDelete:false})
          .skip(skip)
          .limit(limit)
        
        req.session.page=products
        let pages=(count/limit)
        if (req.session.product) {
                let pages=(count/limit)
                let productDetails = req.session.product
                
                req.session.product= null
                req.session.save()
              return res.render('userpages/shoppage', { productDet: productDetails, userLogged: req.session.logged, categoryDet: categoryDetails ,page:pages})
            }
            if (req.session.search) {
                let pages=(count/limit)
                let productDetails = req.session.search
                
                req.session.search = null
                req.session.save()
                return res.render('userpages/shoppage', { productDet: productDetails, userLogged: req.session.logged, categoryDet: categoryDetails ,page:pages})
            }
            if(req.session.category){
                
                let pages=(count/limit)
                let productDetail = req.session.category
                const find= productDetail._id
                const productDetails=await productcollection.find({parentCategory:find})

                req.session.category = null
                req.session.save()
                return res.render('userpages/shoppage', { productDet: productDetails, userLogged: req.session.logged, categoryDet: categoryDetails ,page:pages})
            }
          if(req.session.page){
            
           
             const productDetails=req.session.page
             
             req.session.page=null
             req.session.save()
             return res.render('userpages/shoppage', { userLogged: req.session.logged, productDet: productDetails, categoryDet: categoryDetails,page:pages,})
        }
       
       
        
        
       
        const productDetails = await productcollection.find({isListed:true,isDelete:false}).limit(3)
        
        return res.render('userpages/shoppage', { userLogged: req.session.logged, productDet: productDetails, categoryDet: categoryDetails,page:pages})
        

    }

    catch (err) {
        console.log(err)
    }

}
const logout = async (req, res) => {
    req.session.logged = false
    res.redirect('/')
}

const Fillters =async(req,res)=>{
    console.log(req.body)
   
    if(req.body.search){
        const searchproduct = await productcollection.find({ productName: { $regex: req.body.search, $options: 'i' } })

        req.session.search = searchproduct
        res.redirect('/shop')
    }
    
   
         
        
    
      
       
       
      
        
         if(req.body.PriceAssending){
         const rangeproducts = await productcollection.find({ isListed:true,isDelete:false }).sort({productPrice:Number(req.body.PriceAssending)})
         const category= categorycollection.findOne({_id:req.body.cid})
         req.session.product=rangeproducts
         

         
         res.redirect('/shop')
         }
        
       
        if(req.body.PriceDisending){
        
        const rangeproducts = await productcollection.find({isListed:true,isDelete:false }).sort({productPrice:Number(req.body.PriceDisending)})
        const category= categorycollection.findOne({_id:req.body.cid})
        req.session.product=rangeproducts
         res.redirect('/shop')
        
        } 
        
        
         if(req.body.NameAssending){
        const rangeproducts = await productcollection.find({ isListed:true,isDelete:false }).sort({productName:Number(req.body.NameAssending)})
        const category= categorycollection.findOne({_id:req.body.cid})
        req.session.product=rangeproducts
         res.redirect('/shop')
         }
        
        if(req.body.NameDisending){
        const rangeproducts = await productcollection.find({isListed:true,isDelete:false }).sort({productName:Number(req.body.NameDisending)})
        const category= categorycollection.findOne({_id:req.body.cid})
        req.session.product=rangeproducts
         res.redirect('/shop')
       
        
       }
       
    
    if(req.body.cid){    
    if(req.body.range=='500-1000'){
       
        const rangeproducts = await productcollection.find({parentCategory:req.body?.cid, productPrice: { $gte: 500, $lte: 1000 },isListed:true,isDelete:false })
        req.session.product=rangeproducts
        return res.redirect('/shop')
       
       }

       
     
     if(req.body.range=='1000-1500'){
        
         const rangeproducts = await productcollection.find({parentCategory:req.body?.cid, productPrice: { $gte: 1000, $lte: 1500 },isListed:true,isDelete:false })
         req.session.product=rangeproducts
         return res.redirect('/shop')
         
      }
    
      if(req.body.range=='1500-2000'){
        
         const rangeproducts = await productcollection.find({parentCategory:req.body?.cid, productPrice: { $gte: 1500, $lte: 2000 },isListed:true,isDelete:false })
         req.session.product=rangeproducts
         return res.redirect('/shop')
         
      }
    }else{
        if(req.body.cid){
            const rangeproducts=await productcollection.find({parentCategory:req.body.cid})
            console.log(rangeproducts)
            req.session.product=rangeproducts
            res.redirect('/shop')
        }
    }
   
}

       
    
   
      
       
     
   


const Whishlist=async(req,res)=>{

    try{
    const whishlist = new whishlistCollection({
        productId: req.query.id,
        userId:req.query.action,
        Whishlist:true
    })
    await whishlist.save()
    res.send({list:true})
    }catch(error){
        console.log(error)
    }
 }
 const PageNotfound=async(req,res)=>{
    try{
      res.render('userpages/404')  
    }
    catch(error){
        console.log(error)
    }
 }

    const googleCallback = async (req, res) => {
        try {
            const user = await usercollection.findOneAndUpdate(
                { email: req.user.email }, // Search condition
                { $set: { name: req.user.displayName } }, // Update fields
                { upsert: true, new: true } // Options: upsert (create if not found), new (return updated document)
            );
            
            req.session.logged=user
            res.redirect('/')
        } catch (error) {
            console.error("Error updating user:", error);
            // Handle error
        }
    }
    const notFound=async(req, res)=>{
        res.status(404).render('userpages/404') ;
      };
module.exports = {
    home, signupget, loginget, userRegister, logionverify, verifyotp, resendotp, otppage, register, shopPage,
    singleProduct, logout,Fillters,PageNotfound,googleCallback,notFound
}