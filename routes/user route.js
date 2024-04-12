const express=require('express')
const userconroller=require('../controller/usercontroler')
const router=express.Router()
const userVer=require('../middlewere/userver')
const blockeduser=require('../middlewere/userblock')

router.get('/login',blockeduser,userconroller.loginget)
router.get('/',blockeduser,userVer,userconroller.home)

router.post('/login',userconroller.logionverify)
router.get('/signup',userconroller.signupget)
router.post('/verifyotp',userconroller.verifyotp)
router.post('/signup',userconroller.userRegister)
router.post('/resendotp',userconroller.resendotp)
router.get('/sendotp',userconroller.otppage)
router.post('/register',userconroller.register)
router.get('/shop',userconroller.shoppage)
router.get('/singleProduct',userconroller.singleProduct)
router.get('/logout',userconroller.logout)


module.exports=router