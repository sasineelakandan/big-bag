const express=require('express')
const adminconroller=require('../controller/admincontroller')
const upload = require('../services/multer')
const adminauth=require('../middlewere/adminver')
const router=express.Router()






router.get('/admin',adminconroller.loginpage)
router.post('/adminlogin',adminconroller.adminlogin)
router.post('/adminlogout',adminconroller.adminlogout)
router.get('/usermanagement',adminconroller.usermanagement)
router.get('/userblock',adminconroller.userblock)
router.post('/adminsearch',adminconroller.usersearch)
router.get('/category',adminconroller.categorymanagement)
router.post('/addcategory',adminconroller.addcategory)
router.get('/categorylist',adminconroller.categorylist)
router.get('/adminedit/:id',adminconroller.editcategory)
router.put('/updatecategory/:id',adminconroller.updatecategory)
router.get('/product',adminconroller.product)
router.get('/addproduct',adminconroller.addproduct)
router.post('/addproduct2',upload.any(),adminconroller.addproduct2)
router.get('/productlist',adminconroller.productList)
router.get('/productedit',adminconroller.productedit)
router.post('/productupdate/:id',upload.any(),adminconroller.productupdate)

module.exports=router