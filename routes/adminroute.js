const express=require('express')
const adminConroller=require('../controller/admincontroller')
const productConroller=require('../controller/productController')
const categoryConroller=require('../controller/categoryConroller')
const orderConroller=require('../controller/orderController')
const upload = require('../services/multer')
const {isadmin}=require('../middlewere/adminver')
const productOfferController=require('../controller/OfferController')
const categoryOfferController=require('../controller/categoryOfferController')
const Router=express.Router()





// ADMIN CONTROLLER
Router.get('/admin',adminConroller.loginpage)
Router.post('/adminlogin',adminConroller.adminlogin)
Router.post('/adminlogout',adminConroller.adminlogout)
Router.get('/usermanagement',isadmin,adminConroller.usermanagement)
Router.get('/userblock',adminConroller.userblock)
Router.post('/adminsearch',adminConroller.usersearch)



// CATEGORY CONROLLER
Router.get('/category',isadmin,categoryConroller.categoryManagement)
Router.post('/addcategory',categoryConroller.addCategory)
Router.get('/categorylist',categoryConroller.categoryList)
Router.get('/adminedit/:id',categoryConroller.editCategory)
Router.post('/updatecategory',categoryConroller.updateCategory)





//PRODUCT CONTROLLER
Router.get('/product',isadmin,productConroller.Product)
Router.get('/addproduct',productConroller.addProduct)
Router.post('/addproduct2',upload.any(),productConroller.addProduct2)
Router.get('/productlist',productConroller.productList)
Router.get('/productedit',productConroller.productEdit)
Router.post('/productupdate/:id',upload.any(),productConroller.productUpdate)
Router.post("/delete-image", productConroller.deleteImage);
Router.get('/productdelete',productConroller.deleteProduct)

//Order Controller
Router.get('/order',orderConroller.adminOrder)
Router.get('/orderStatus',orderConroller.orderStatus)
Router.put('/updateStatus',orderConroller.updateStatus)
Router.put('/updateStatus2',orderConroller.updateStatus2)

//product offer controller

Router.get('/productOffer',productOfferController.productOfferget)
Router.post('/productOfferDet',productOfferController.productofferDet)
Router.put('/productOfferedit',productOfferController.productofferEdit)
Router.get('/productOfferedit',productOfferController.productEditpageget)
//categoryOffer 
Router.get('/categoryOffer',categoryOfferController.categoryOfferget)
Router.get('/categoryEditpage',categoryOfferController.categoryOffereditget)
Router.post('/categoryOfferDet',categoryOfferController.categoryofferDet)
Router.put('/categoryOfferedit',categoryOfferController.categoryOfferedit)
module.exports=Router