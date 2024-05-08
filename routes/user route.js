const express=require('express')
const userConroller=require('../controller/usercontroler')
const addressController=require('../controller/addressController')
const cartController=require('../controller/cartController')
const paymentcontroller=require('../controller/Paypalpaymentcontroller')
const Router=express.Router()
const {isuser}=require('../middlewere/userver')
const blockedUser=require('../middlewere/userblock')
const orderConroller=require('../controller/orderController')
const passport = require('passport')

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
Router.get('/singleProduct',isuser,blockedUser,userConroller.singleProduct)
Router.get('/logout',userConroller.logout)

Router.post('/filtter',userConroller.Fillters)


// addressController
Router.get('/account',isuser,blockedUser,addressController.account)
Router.get('/addaddress',isuser,blockedUser,addressController.addaddress)
Router.post('/addaddress',isuser,blockedUser,addressController.addaddress2)
Router.get('/myaddress',isuser,blockedUser,addressController.Myaddress)
Router.get('/editadd/:id',blockedUser,addressController.editAdd)
Router.put('/updateadd',addressController.updateAdd)
Router.get('/deleteAdd',addressController.deleteAdd)
Router.put('/updatePro',addressController.updatePro)
//cart
Router.get('/cart',isuser,blockedUser,cartController.Cart)
Router.post("/addtocart",isuser,cartController.addTocart)
Router.get('/cartbutton',cartController.cartbutton)
Router.get('/removecart',cartController.removeCart)
//checkout
Router.get('/checkout',blockedUser,cartController.checkOut1)
Router.get('/checkout2',blockedUser,cartController.checkOut2)
Router.get('/checkout3',blockedUser,cartController.checkOut3)
Router.post('/checkout4',blockedUser,cartController.checkOut4)
Router.get('/checkout5',cartController.checkOut5)
//orders
Router.get('/allorders',blockedUser,orderConroller.allOrder)
Router.get('/singleorders',blockedUser,orderConroller.singleOrder)
Router.put('/cancel',orderConroller.Cancel)
Router.put('/cancelall',orderConroller.Cancelall)
Router.put('/return',orderConroller.RetunOrder)
//whishlist
Router.get('/whishlist',userConroller.Whishlist)
Router.get('/whishlist2',userConroller.Whishlist2)
Router.get('/removewhishlist',userConroller.WhishlistRemove)
Router.post('/addtocart2',userConroller.whishToCart)
//googleAuth

Router.get('/googleAuth/googlever',passport.authenticate('google',{scope:['email','profile']}))
Router.get('/google/callback',passport.authenticate('google'),userConroller.googleCallback)
//online payment
Router.get('/pay',paymentcontroller.paymentPage)
module.exports=Router