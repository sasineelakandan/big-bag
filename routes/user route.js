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
Router.post('/Filtter',userConroller.Fillters)
Router.post('/shopSort',userConroller.shopSort)
Router.post('/shopSort2',userConroller.filter)
Router.post('/shopSort3',userConroller.filter2)
Router.get('/removefiltter',userConroller.removeAllFillters)
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
Router.post('/applyCoupons',cartController.applyCoupon)
Router.post('/removeCoupon',cartController.removeCoupan)
//checkout
Router.get('/checkout',isuser,blockedUser,cartController.checkOut1)
Router.get('/checkout2',isuser,blockedUser,cartController.checkOut2)
Router.get('/checkout3',isuser,blockedUser,cartController.checkOut3)
Router.post('/checkout4',isuser,blockedUser,cartController.checkOut4)
Router.get('/checkout5',isuser,cartController.checkOut5)
Router.get('/checkout6',isuser,cartController.Chek3page)
//orders
Router.get('/allorders',isuser,blockedUser,orderConroller.allOrder)
Router.get('/singleorders',isuser,blockedUser,orderConroller.singleOrder)
Router.put('/cancel',isuser,orderConroller.Cancel)
Router.put('/cancelall',isuser,orderConroller.Cancelall)
Router.put('/return',orderConroller.RetunOrder)
Router.get('/account/orderList/orderStatus/downloadInvoice',isuser,orderConroller.downloadInvoice)
//whishlist
Router.get('/whishlist',isuser,userConroller.Whishlist)
Router.get('/whishlist2',isuser,userConroller.Whishlist2)
Router.delete('/removeWishlist',isuser,userConroller.WhishlistRemove)
Router.post('/addtocart2',isuser,userConroller.whishToCart)
Router.get('/removewish',userConroller.removeWish)
//googleAuth

Router.get('/googleAuth/googlever',passport.authenticate('google',{scope:['email','profile']}))
Router.get('/google/callback',passport.authenticate('google'),userConroller.googleCallback)
//online payment
Router.get('/pay',isuser,paymentcontroller.paymentPage)
Router.get('/errPay',isuser,paymentcontroller.errPage)
Router.get('/pay2',isuser,paymentcontroller.paymentPage2)
Router.get('/Wallet',isuser,paymentcontroller.Wallet)
module.exports=Router