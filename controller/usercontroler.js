const usercollection = require('../model/usermodel')
const otpcollections = require('../model/otpmodel')
const categorycollection = require('../model/categorymodel')
const productcollection = require("../model/productmodel")
const sendotp = require("../services/sendotp")
const auth = require('../middlewere/googleAuth')
const bcrypt = require('bcryptjs')
const cartCollection = require('../model/cartmodel')
const { productList } = require('./productController')
const offer = require('../controller/OfferController')
const categoryOffer = require('../controller/categoryOfferController')
const whishlistCollection = require('../model/whishlistmodel')
const AppError=require('../middlewere/errorhandling')
const BestOffer = require('../services/helpper')
const ReferalCode=require('../services/referal')



const home = async (req, res,next) => {
    try {
        const productDetails = await productcollection.find({ isListed: true })
        const categoryDetails = await categorycollection.find({ isListed: true })

        if (req.session.logged) {

            res.render('userpages/home', { userLogged: req.session.logged, productDetails, categoryDetails })
        } else {
            res.render('userpages/home', { userLogged: null, productDetails, categoryDetails })
        }
    } catch (err) {
        next(new AppError('Somthing went Wrong', 500))
    }

}


const otppage = async(req, res,next) => {
    try {
        if (req.session.user) {
            req.session.user=false
            res.redirect('/')
        } else {
            let diffInSeconds;
            const existingOtp = await otpcollections.findOne({ userId: req.session.loggedNew._id });
            
            if (existingOtp) {
              const createdAt = existingOtp.generatedDate;
              const currentDate = new Date();
              const diffInMs = currentDate.getTime() - createdAt.getTime();
              diffInSeconds = Math.floor(diffInMs / 1000);
              
            } else {
              diffInSeconds = null;
            }
            res.render('userpages/otppage',{diffInSeconds})
        }

    } catch (err) {
        next(new AppError('Somthing went Wrong', 500))
    }
}



const loginget = async (req, res,) => {


    if (req.session.logged) {



        res.redirect('/')
    } else {
        res.render('userpages/login')
    }
}

const signupget = (req, res,next) => {
    try { const Referal=req.query.referral
        
        if (req.session.logged) {
            res.redirect('/')
        } else {
            res.render('userpages/signup',{referral:Referal})
        }
    } catch (err) {
        next(new AppError('Somthing went Wrong', 500))
    }

}

const verifyotp = async (req, res,next) => {




    try {
        const usersOTP = await otpcollections.findOne({ userId: req.session.loggedNew._id });


        const otpmatch = await bcrypt.compare(req.body.otp, usersOTP.otp)

        const notExpired = usersOTP.expiryDate.toISOString() > new Date().toISOString()


        if (otpmatch && notExpired) {

            await usercollection.updateOne({ _id: req.session.loggedNew._id }, { $set: { isVerified: true } })
            req.session.user = true
            req.session.logged=await usercollection.findOne({_id: req.session.loggedNew._id})
            res.status(200).send({ otpverified: true })
        } else {
            res.status(200).send({ otpinvalid: true })
        }


    } catch (error) {
        next(new AppError('Somthing went Wrong', 500))
}
}
const register = async (req, res,next) => {
    try {

        const checksignin = await usercollection.findOne({ $or: [{ email: req.body.email }, { phone: req.body.phone }] })

        if (checksignin) {
            res.status(208).send({ userExists: true })
        } else {
            res.status(200).send({ userExists: false })
        }

    } catch (err) {
        next(new AppError('Somthing went Wrong', 500))
    }
}

const singleProduct = async (req, res,next) => {
    try {

        const productDetails = await productcollection.findOne({ _id: req.query.id })
        const categoryDetails = await categorycollection.findOne({ _id: req.query.id })







        res.render('userpages/singleProduct', { userLogged: req.session.logged, productDet: productDetails, categoryDet: categoryDetails })
    }

    catch (err) {
        next(new AppError('Somthing went Wrong', 500))
    }
}

const userRegister = async (req, res,next) => {



        

    try { 
        const refferal = Math.floor(100000 + Math.random() * 900000);
        const bcryptpassword = await bcrypt.hash(req.body.password, 10)
        const user = new usercollection({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            password: bcryptpassword,
            ReferalCode:refferal
        })
        await user.save()


        if (req.query.otp) {
            req.session.loggedNew = await usercollection.findOne({ email: req.body.email })

            const genratedotp = Math.floor(100000 + Math.random() * 900000).toString()
            await sendotp(req.session.loggedNew, genratedotp)
            await  ReferalCode.Referal(req.body.ReferalCode,req.body.email)
            const bcryptotp = bcrypt.hashSync(genratedotp, 10)
            const userotp = new otpcollections({
                userId: req.session.loggedNew._id,
                otp: bcryptotp,
                generatedDate: new Date().toISOString(),
                expiryDate: new Date(Date.now() + 60000).toISOString()
            })
            await userotp.save()



        }
        res.status(200).send({ userSaved: true })
    }
    catch (error) {
        next(new AppError('Somthing went Wrong', 500))
    }
}

const logionverify = async (req, res,next) => {

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
        next(new AppError('Somthing went Wrong', 500))
    }
}




const resendotp = async (req, res,next) => {
    try {

        const generatedotp = Math.floor(100000 + Math.random() * 900000).toString()
        await sendotp(req.session.loggedNew, generatedotp)
        const bycryptotp = bcrypt.hashSync(generatedotp, 10)
        await otpcollections.updateOne({ userId: req.session.loggedNew._id }, { $set: { otp: bycryptotp, generatedDate: new Date().toISOString(), expiryDate: new Date(Date.now() + 60000).toISOString() } })

        res.status(200).send({ otpsend: true })
    } catch (err) {
        next(new AppError('Somthing went Wrong', 500));
    }
}


const shopPage = async (req, res,next) => {
    try {
        categoryOffer.categoryOfferExpiry()
        offer.productOfferExpiry()
        BestOffer.BestOffer()
        
        let productDetails = req.session.productDetail || await productcollection.find({ isListed: true })
        const categoryDetails = await categorycollection.find({ isListed: true })
        const productsPerPage = 3
        const totalPages = productDetails.length / productsPerPage
        const pageNo = req.query.pages || 1
        const start = (pageNo - 1) * productsPerPage
        const end = start + productsPerPage
        productDetails = productDetails.slice(start, end)
        if (req.session.logged) {

            const { _id } = req.session?.logged
            let whishlistDet = await whishlistCollection.find({ userId: _id })
            let whishlistarr = []
            for (i = 0; i < whishlistDet.length; i++) {
                whishlistarr.push(whishlistDet[i].productId.toString())
            }

            for (i = 0; i < productDetails.length; i++) {

                productDetails[i].isWhishlisted = whishlistarr.includes(productDetails[i]._id.toString())
            
            }

        }

        res.render('userpages/shoppage', { userLogged: req.session.logged, productDet: productDetails, categoryDet: categoryDetails, totalPages })
    } catch (err) {
        next(new AppError('Somthing went Wrong', 500))
    }
}

const shopSort = async (req, res,next) => {

    try {
        let productDetail = req.session.productDetail || await productcollection.find({ isListed: true })
        switch (req.body.sortBy) {
            case 'priceAsc': {
                productDetail = productDetail.sort((a, b) => a.productPrice - b.productPrice)
                break;
            }
            case 'priceDes': {
                productDetail = productDetail.sort((a, b) => b.productPrice - a.productPrice)
                break;
            }
            case 'nameAsc': {
                productDetail = productDetail.sort((a, b) => a.productName.localeCompare(b.productName))
                break;
            }
            case 'nameDes': {
                productDetail = productDetail.sort((a, b) => b.productName.localeCompare(a.productName))
                break;
            }
            case 'newProduct': {
                productDetail = productDetail.sort((a, b) => b._id - a._id)
                break;
            }

        }

        req.session.productDetail = productDetail
        res.redirect('/shop')

    } catch (err) {
        next(new AppError('Somthing went Wrong', 500))
    }
}

const filter = async (req, res,next) => {
    try {
        
        let productDetail = req.session.productDetail || await productcollection.find({ isListed: true })
        let start = 0, end = Infinity


        switch (req.body.sortBy) {
            case '0': {
                start = 0; end = 100
                break
            }
            case '1': {
                start = 100; end = 150
                break
            }
            case '2': {
                start = 150; end = 200
                break
            }
            case '3': {
                start = 200; end = Infinity
                break
            }
        }


        productDetail = productDetail.filter((val) => {
            
            return val.productPrice > start && val.productPrice <= end
        })
        
        req.session.productDetail = productDetail

        res.redirect('/shop')

    } catch (err) {
        next(new AppError('Somthing went Wrong', 500));
    }
}


const filter2 = async (req, res,next) => {
    try {
        productDetail = await productcollection.find({ isListed: true, parentCategory: req.body.cid })
        req.session.productDetail = productDetail

        res.redirect('/shop')
    } catch (error) {
        next(new AppError('Somthing went Wrong', 500))
    }
}


const logout = async (req, res) => {
    req.session.logged = false
    res.redirect('/')
}

const Fillters = async (req, res,next) => {
    try{
        const searchuser = await productcollection.find({ productName: { $regex: req.body.search, $options: 'i' } })
        req.session.productDetail=searchuser
        res.redirect('/shop')
    }catch(error){
        next(new AppError('Somthing went Wrong', 500))
    }



}
const Whishlist = async (req, res,next) => {

    try {


        

        if (req.query.action) {
            const whishlist = new whishlistCollection({
                productId: req.query.id,
                userId: req.query.action,
                Whishlist: true
            })
            req.session.whishlist = whishlist

            await whishlist.save()

            res.send({ list: true })

        } else {
            res.send({ unlist: false })
        }




    }

    catch (error) {
        next(new AppError('Somthing went Wrong', 500))
    }
}
const WhishlistRemove = async (req, res) => {
    
    await whishlistCollection.deleteOne({ productId: req.query.id })
    res.send({ list: true })
}

const Whishlist2 = async (req, res) => {
    const Whishlist = await whishlistCollection.find({ userId: req.query.id })
    
    let products = []
    for (i = 0; i < Whishlist.length; i++) {
        Whishlist[i].productId
        const prod = await productcollection.find({ _id: Whishlist[i].productId })
        products.push(prod)

    }
    const productDetail = products.flat()
    
    res.render('userpages/whishlist', { whishlistDet: Whishlist, userLogged: req.session.logged, productDet: productDetail })

}

const googleCallback = async (req, res,next) => {
    try {
        const user = await usercollection.findOneAndUpdate(
            { email: req.user.email }, // Search condition
            { $set: { name: req.user.displayName } }, // Update fields
            { upsert: true, new: true } // Options: upsert (create if not found), new (return updated document)
        );

        req.session.logged = user
        res.redirect('/')
    } catch (error) {
        next(new AppError('Somthing went Wrong', 500))
        // Handle error
    }
}
const notFound = async (req, res) => {
    res.status(404).render('userpages/404');
};


const whishToCart = async (req, res,next) => {

try{
    const productExist = await cartCollection.findOne({
        userId: req.session.logged._id,
        productId: req.query.pid,
    });

    if (productExist) {

        res.send({ productExist: true })
    } else {
        const qty2 = await productcollection.findOne({ _id: req.query.pid })
        const productPrice = parseInt(qty2.productPrice)
        const offerPrice = parseInt(qty2.priceBeforeOffer)

        if (0 < qty2.productStock) {
            const newcart = new cartCollection({
                userId: req.query.userid,
                productId: req.query.pid,
                productQuantity: 1,
                productStock: qty2.productStock,
                productprice: productPrice,
                Status: 'pending',
                totalCostPerProduct: productPrice,
                productImage: qty2.productImage[0],
                productName: qty2.productName,
            })
            newcart.save()
            res.send({ success: true })
        } else {
            res.send({ OutStock: true })
        }
    }
}catch(err){
    next(new AppError('Somthing went Wrong', 500))
}

}
const removeWish = async (req, res,next) => {
    try {
        
        await whishlistCollection.deleteOne({ _id: req.query.id })
        res.send({ success: true })
    } catch {
        next(new AppError('Somthing went Wrong', 500))
    }
}
const removeAllFillters = async (req, res,next) => {
    try {
        req.session.productDetail = null
        res.redirect('/shop')
    } catch (error) {
        next(new AppError('Somthing went Wrong', 500))
    }
}
const forgotPassword=async(req,res,next)=>{
    try{
         res.render('userpages/forgotPassword')
    }
    catch(error){
        next(new AppError('Somthing went Wrong', 500))
    }
}
const forgotPassword2=async(req,res,next)=>{
    try{
        const user=await usercollection.findOne({email:req.body.email})
        req.session.otpuser=user
        if(user){
           

            const genratedotp = Math.floor(100000 + Math.random() * 900000).toString()
            await sendotp(user, genratedotp)
          
            const bcryptotp = bcrypt.hashSync(genratedotp, 10)
            const userotp = new otpcollections({
                userId:user._id,
                otp: bcryptotp,
                generatedDate: new Date().toISOString(),
                expiryDate: new Date(Date.now() + 60000).toISOString()
            })
            await userotp.save()
            res.send({success:true})
        }
    }
    catch(error){
        next(new AppError('Somthing went Wrong', 500))
    }
}
const forgotPassword3=async(req,res,next)=>{
    try{
        let diffInSeconds;
        const existingOtp = await otpcollections.findOne({ userId: req.session.otpuser._id });
        
        if (existingOtp) {
          const createdAt = existingOtp.generatedDate;
          const currentDate = new Date();
          const diffInMs = currentDate.getTime() - createdAt.getTime();
          diffInSeconds = Math.floor(diffInMs / 1000);
        
        } else {
          diffInSeconds = null;
        }
    res.render('userpages/veryfyOtpPageForgot',{diffInSeconds})
    }
    catch(error){
        next(new AppError('Somthing went Wrong', 500)) 
    }
}
const verifyotp2 = async (req, res,next) => {

        
  
    try {
        const usersOTP = await otpcollections.findOne({ userId: req.session.otpuser._id });
        
        // Check if usersOTP is found
        if (!usersOTP) {
            
            return res.status(200).send({ otpinvalid: true });
        }
    
        
        
    
        // Compare provided OTP with stored hashed OTP
        const otpmatch = await bcrypt.compare(req.body.otp, usersOTP.otp);
        
    
        // Check if OTP is not expired
        const notExpired = usersOTP.expiryDate.toISOString() > new Date().toISOString();
        
        await otpcollections.deleteOne({userId:req.session.otpuser._id })
        if (otpmatch && notExpired) {
            await usercollection.updateOne({ _id: req.session.otpuser._id }, { $set: { isVerified: true } });
            req.session.user1 = true;
            
            res.status(200).send({ otpverified: true });
        } else {
            res.status(200).send({ otpinvalid: true });
        }
    } catch (error) {
        console.error('Error occurred:', error);
        next(new AppError('Something went wrong', 500));
    }
    
}
const forgotSuccess=async(req,res,next)=>{
    try{
       
       res.render('userpages/forgotsuccesPage')
    }
    catch(error){
        next(new AppError('Something went wrong', 500)); 
    }
}
const resetPassword=async(req,res,next)=>{
    try{
        
        const bcryptpassword = await bcrypt.hash(req.body.confirmPassword, 10)
        const user= await usercollection.updateOne({email:req.body.email},{$set:{password:bcryptpassword}})
        
        res.send({success:true})
    }
    catch(error){
        next(new AppError('Something went wrong', 500)); 
    }
}
const resendotp2=async(req,res,next)=>{
    try {
        
        const generatedotp = Math.floor(100000 + Math.random() * 900000).toString()
        
        await sendotp(req.session.otpuser, generatedotp)
        const bycryptotp = bcrypt.hashSync(generatedotp, 10)
     const  user= await otpcollections.updateOne({ userId: req.session.otpuser._id }, { $set: { otp: bycryptotp, generatedDate: new Date().toISOString(), expiryDate: new Date(Date.now() + 60000).toISOString() } })
      
        res.status(200).send({ otpsend: true })
    } catch (err) {
        next(new AppError('Somthing went Wrong', 500));
    }
}
module.exports = {
    home, signupget, loginget, userRegister, logionverify, verifyotp, resendotp, otppage, register, shopPage,
    singleProduct, logout, Fillters, googleCallback, notFound, Whishlist, WhishlistRemove, Whishlist2, whishToCart, removeWish, shopSort,
    filter, filter2, removeAllFillters,forgotPassword,forgotPassword2,forgotPassword3,verifyotp2,forgotSuccess,resetPassword,resendotp2
}