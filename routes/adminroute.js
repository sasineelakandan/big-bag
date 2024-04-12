const express=require('express')
const adminconroller=require('../controller/admincontroller')
const productConroller=require('../controller/productController')
const categoryConroller=require('../controller/categoryConroller')
const upload = require('../services/multer')
const adminauth=require('../middlewere/adminver')
const Router=express.Router()





// ADMIN CONTROLLER
Router.get('/admin',adminconroller.loginpage)
Router.post('/adminlogin',adminconroller.adminlogin)
Router.post('/adminlogout',adminconroller.adminlogout)
Router.get('/usermanagement',adminconroller.usermanagement)
Router.get('/userblock',adminconroller.userblock)
Router.post('/adminsearch',adminconroller.usersearch)



// CATEGORY CONROLLER
Router.get('/category',categoryConroller.categoryManagement)
Router.post('/addcategory',categoryConroller.addCategory)
Router.get('/categorylist',categoryConroller.categoryList)
Router.get('/adminedit/:id',categoryConroller.editCategory)
Router.put('/updatecategory/:id',categoryConroller.updateCategory)



//PRODUCT CONTROLLER
Router.get('/product',productConroller.Product)
Router.get('/addproduct',productConroller.addProduct)
Router.post('/addproduct2',upload.any(),productConroller.addProduct2)
Router.get('/productlist',productConroller.productList)
Router.get('/productedit',productConroller.productEdit)
Router.post('/productupdate/:id',upload.any(),productConroller.productUpdate)

module.exports=Router