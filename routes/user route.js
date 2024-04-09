const express=require('express')
const userconroller=require('../controller/usercontroler')
const router=express.Router()


router.get('/',userconroller.home)
router.get('/login',userconroller.loginget)
router.post('/login',userconroller.logionverify)
router.get('/signup',userconroller.signupget)
router.post('/verifyotp',userconroller.verifyotp)
router.post('/signup',userconroller.userRegister)
router.post('/resendotp',userconroller.resendotp)
router.get('/sendotp',userconroller.otppage)
router.post('/register',userconroller.register)
router.get('/shop',userconroller.shoppage)


module.exports=router