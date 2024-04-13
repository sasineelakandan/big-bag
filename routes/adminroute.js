const express=require('express')
const adminConroller=require('../controller/admincontroller')
const productConroller=require('../controller/productController')
const categoryConroller=require('../controller/categoryConroller')

const upload = require('../services/multer')
const adminauth=require('../middlewere/adminver')
const Router=express.Router()





// ADMIN CONTROLLER
Router.get('/admin',adminConroller.loginpage)
Router.post('/adminlogin',adminConroller.adminlogin)
Router.post('/adminlogout',adminConroller.adminlogout)
Router.get('/usermanagement',adminConroller.usermanagement)
Router.get('/userblock',adminConroller.userblock)
Router.post('/adminsearch',adminConroller.usersearch)



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
Router.post("/delete-image", productConroller.deleteImage);

module.exports=Router