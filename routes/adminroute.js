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
const couPonController=require('../controller/CouponController')
const salesConroller=require('../controller/SalesController')



// ADMIN CONTROLLER
Router.get('/admin',adminConroller.loginpage)
Router.post('/adminlogin',adminConroller.adminlogin)
Router.post('/adminlogout',adminConroller.adminlogout)
Router.get('/usermanagement',isadmin,adminConroller.usermanagement)
Router.get('/userblock',isadmin,adminConroller.userblock)
Router.post('/adminsearch',isadmin,adminConroller.usersearch)
Router.get('/admin/adminhome/Top3',isadmin,adminConroller.topProduct)
Router.get('/admin/adminhome/Top3category',adminConroller.topCategory)
Router.get('/dashboardData',isadmin,adminConroller.dashboardData)



// CATEGORY CONROLLER
Router.get('/category',isadmin,categoryConroller.categoryManagement)
Router.post('/addcategory',isadmin,categoryConroller.addCategory)
Router.get('/categorylist',isadmin,categoryConroller.categoryList)
Router.get('/adminedit/:id',isadmin,categoryConroller.editCategory)
Router.post('/updatecategory',categoryConroller.updateCategory)





//PRODUCT CONTROLLER
Router.get('/product',isadmin,productConroller.Product)
Router.get('/addproduct',isadmin,productConroller.addProduct)
Router.post('/addproduct2',upload.any(),productConroller.addProduct2)
Router.get('/productlist',productConroller.productList)
Router.get('/productedit',isadmin,productConroller.productEdit)
Router.post('/productupdate/:id',upload.any(),productConroller.productUpdate)
Router.post("/delete-image", productConroller.deleteImage);
Router.get('/productdelete',productConroller.deleteProduct)

//Order Controller
Router.get('/order',isadmin,orderConroller.adminOrder)
Router.get('/orderStatus',isadmin,orderConroller.orderStatus)
Router.put('/updateStatus',orderConroller.updateStatus)
Router.put('/updateStatus2',orderConroller.updateStatus2)

//product offer controller

Router.get('/productOffer',isadmin,productOfferController.productOfferget)
Router.post('/productOfferDet',productOfferController.productofferDet)
Router.put('/productOfferedit',productOfferController.productofferEdit)
Router.get('/productOfferedit',isadmin,productOfferController.productEditpageget)
Router.get('/productDel',productOfferController.ProductDel)
//categoryOffer 
Router.get('/categoryOffer',isadmin,categoryOfferController.categoryOfferget)
Router.get('/categoryEditpage',isadmin,categoryOfferController.categoryOffereditget)
Router.post('/categoryOfferDet',categoryOfferController.categoryofferDet)
Router.put('/categoryOfferedit',categoryOfferController.categoryOfferedit)
Router.get('/categoryDel',categoryOfferController.catOffDel)
//couPon
Router.get('/coupons',isadmin,couPonController.Couponget)
Router.get('/couponEditpage',isadmin,couPonController.CouponEditget)
Router.post('/couponDet',couPonController.CouponOffDet)
Router.put('/couponOfferedit',couPonController.CouponOffEdit)
Router.get('/coupondelete',couPonController.couponDelete)

//salesReport
Router.get('/Sales',isadmin,salesConroller.SalesReportGet)
Router.post('/filterdate',salesConroller.filterDate)
Router.get("/salesReport/download/xlsx",salesConroller.salesReportDownload);
Router.get('/salesReport/download/pdf',salesConroller.salesReportDownloadPDF)
Router.get('/removefilter',salesConroller.removeAllFillters)
Router.post('/admin/salesReport/filter',salesConroller.filterDates)
module.exports=Router