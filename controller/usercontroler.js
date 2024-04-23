const usercollection = require('../model/usermodel')
const otpcollections = require('../model/otpmodel')
const categorycollection = require('../model/categorymodel')
const productcollection = require("../model/productmodel")
const sendotp = require("../services/sendotp")
const bcrypt = require('bcryptjs')
const { productList } = require('./productController')



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

        const categoryDetails = await categorycollection.find({ isListed: true })
        let query = { isListed: true };
        if (req.query.id) {
            query.parentCategory = req.query.id;
        }
        if (req.session.search) {
            let pages=(count/limit)
            let productDetails = req.session.search
            req.session.search = null
            req.session.save()
          return res.render('userpages/shoppage', { productDet: productDetails, userLogged: req.session.logged, categoryDet: categoryDetails ,page:pages})
        }
        if(req.session.range){
            let pages=(count/limit)
            let productDetails=req.session.range
            req.session.range=null
            req.session.save()
            return res.render('userpages/shoppage', { productDet: productDetails, userLogged: req.session.logged, categoryDet: categoryDetails ,page:pages})
        }
        if(req.session.sort){
            let pages=(count/limit)
            let productDetails=req.session.sort
            req.session.sort=null
            req.session.save()
            return res.render('userpages/shoppage', { productDet: productDetails, userLogged: req.session.logged, categoryDet: categoryDetails ,page:pages})
        }
        if(req.session.price){
            let pages=(count/limit)
            let productDetails=req.session.price
            req.session.price=null
            req.session.save()
            return res.render('userpages/shoppage', { productDet: productDetails, userLogged: req.session.logged, categoryDet: categoryDetails ,page:pages})
        }
        if(req.session.parent){
            let pages=(count/limit)
            const productDetails=req.session.parent
            
            req.session.parent=null
            req.session.save()
        
            return res.render('userpages/shoppage', { productDet: productDetails, userLogged: req.session.logged, categoryDet: categoryDetails,page:pages})
        }
        
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
          if(req.session.page){
             
             
             const productDetails=req.session.page
             
             req.session.page=null
             req.session.save()
             return res.render('userpages/shoppage', { userLogged: req.session.logged, productDet: productDetails, categoryDet: categoryDetails,page:pages})
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
const prodeuctsearch = async (req, res) => {
    try {
        if (req.query.search) {
            const searchproduct = await productcollection.find({ productName: { $regex: req.query.search, $options: 'i' } })

            req.session.search = searchproduct
            res.redirect('/shop')
        }
    }
    catch (err) {
        console.log(err)
    }
}
const priceRange=async(req,res)=>{
    
    if(req.query.range=='500-1000'){
      
       const rangeproducts = await productcollection.find({ productPrice: { $gte: 500, $lte: 1000 },isListed:true,isDelete:false })
       req.session.range=rangeproducts
       return res.redirect('/shop')
       
    }
    if(req.query.range=='1000-1500'){
      
        const rangeproducts = await productcollection.find({ productPrice: { $gte: 1000, $lte: 1500 },isListed:true,isDelete:false })
        req.session.range=rangeproducts
        return res.redirect('/shop')
        
     }
     if(req.query.range=='1500-2000'){
      
        const rangeproducts = await productcollection.find({ productPrice: { $gte: 1500, $lte: 2000 },isListed:true,isDelete:false })
        req.session.range=rangeproducts
        return res.redirect('/shop')
        
     }
}
const nameSort=async(req,res)=>{
    if(req.query.sort=='true'){
        
        const sortname=await productcollection.find({isListed:true,isDelete:false}).sort({productName:1})
        
        req.session.sort=sortname
        
        return res.redirect('/shop')
    }else{
        const sortname=await productcollection.find({isListed:true,isDelete:false}).sort({productName:-1})
        
        req.session.sort=sortname
        
        return res.redirect('/shop')
    }
}
const priceSort=async(req,res)=>{
if(req.query.price==='true'){

   const sortprice=await productcollection.find({isListed:true,isDelete:false}).sort({productPrice:1})
   req.session.price=sortprice
   return res.redirect('/shop')
}else{
    
    const sortprice=await productcollection.find({isListed:true,isDelete:false}).sort({productPrice:-1})
    req.session.price=sortprice
    
    return res.redirect('/shop')
}
}
const Parent=async(req,res)=>{
  if(req.query.id){
    
    
    
    const parent=await productcollection.find({parentCategory:req.query.id,isListed:true,isDelete:false})
    
    req.session.parent=parent
    res.redirect('/shop')
  }
}

module.exports = {
    home, signupget, loginget, userRegister, logionverify, verifyotp, resendotp, otppage, register, shopPage,
    singleProduct, logout, prodeuctsearch,priceRange,nameSort,priceSort,Parent,
}