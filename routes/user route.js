const express=require('express')
const userConroller=require('../controller/usercontroler')
const addressController=require('../controller/addressController')

const Router=express.Router()
const userVer=require('../middlewere/userver')
const blockedUser=require('../middlewere/userblock')

Router.get('/login',userConroller.loginget)
Router.get('/',blockedUser,userConroller.home)

Router.post('/login',userConroller.logionverify)
Router.get('/signup',userConroller.signupget)
Router.post('/verifyotp',userConroller.verifyotp)
Router.post('/signup',userConroller.userRegister)
Router.post('/resendotp',userConroller.resendotp)
Router.get('/sendotp',userConroller.otppage)
Router.post('/register',userConroller.register)
Router.get('/shop',blockedUser,userConroller.shopPage)
Router.get('/singleProduct',blockedUser,userConroller.singleProduct)
Router.get('/logout',userConroller.logout)
Router.get('/productsearch',userConroller.prodeuctsearch)
Router.get('/price',userConroller.priceRange)
Router.get('/namesort',userConroller.nameSort)
Router.get('/pricesort',userConroller.priceSort)
Router.get('/parent',userConroller.Parent)

// addressController
Router.get('/account',addressController.account)
Router.get('/addaddress',addressController.addaddress)
module.exports=Router