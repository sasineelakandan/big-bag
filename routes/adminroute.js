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
Router.get('/admin/usermanagement',isadmin,adminConroller.usermanagement)
Router.get('/admin/userblock',isadmin,adminConroller.userblock)
Router.post('/admin/adminsearch',isadmin,adminConroller.usersearch)
Router.get('/admin/adminhome/Top3',isadmin,adminConroller.topProduct)
Router.get('/admin/adminhome/Top3category',adminConroller.topCategory)
Router.get('/admin/dashboardData',isadmin,adminConroller.dashboardData)



// CATEGORY CONROLLER
Router.get('/admin/category',isadmin,categoryConroller.categoryManagement)
Router.post('/admin/addcategory',isadmin,categoryConroller.addCategory)
Router.get('/admin/categorylist',isadmin,categoryConroller.categoryList)
Router.get('/admin/adminedit/:id',isadmin,categoryConroller.editCategory)
Router.post('/admin/updatecategory',categoryConroller.updateCategory)





//PRODUCT CONTROLLER
Router.get('/admin/product',isadmin,productConroller.Product)
Router.get('/admin/addproduct',isadmin,productConroller.addProduct)
Router.post('/admin/addproduct2',upload.any(),productConroller.addProduct2)
Router.get('/admin/productlist',productConroller.productList)
Router.get('/admin/productedit',isadmin,productConroller.productEdit)
Router.post('/admin/productupdate/:id',upload.any(),productConroller.productUpdate)
Router.post("/admin/delete-image", productConroller.deleteImage);
Router.get('/admin/productdelete',productConroller.deleteProduct)

//Order Controller
Router.get('/admin/order',isadmin,orderConroller.adminOrder)
Router.get('/admin/orderStatus',isadmin,orderConroller.orderStatus)
Router.put('/admin/updateStatus',orderConroller.updateStatus)
Router.put('/admin/updateStatus2',orderConroller.updateStatus2)

//product offer controller

Router.get('/admin/productOffer',isadmin,productOfferController.productOfferget)
Router.post('/admin/productOfferDet',productOfferController.productofferDet)
Router.put('/admin/productOfferedit',productOfferController.productofferEdit)
Router.get('/admin/productOfferedit',isadmin,productOfferController.productEditpageget)
Router.get('/admin/productDel',productOfferController.ProductDel)
//categoryOffer 
Router.get('/admin/categoryOffer',isadmin,categoryOfferController.categoryOfferget)
Router.get('/admin/categoryEditpage',isadmin,categoryOfferController.categoryOffereditget)
Router.post('/admin/categoryOfferDet',categoryOfferController.categoryofferDet)
Router.put('/admin/categoryOfferedit',categoryOfferController.categoryOfferedit)
Router.get('/admin/categoryDel',categoryOfferController.catOffDel)
//couPon
Router.get('/admin/coupons',isadmin,couPonController.Couponget)
Router.get('/admin/couponEditpage',isadmin,couPonController.CouponEditget)
Router.post('/admin/couponDet',couPonController.CouponOffDet)
Router.put('/admin/couponOfferedit',couPonController.CouponOffEdit)
Router.get('/admin/coupondelete',couPonController.couponDelete)

//salesReport
Router.get('/Sales',isadmin,salesConroller.SalesReportGet)
Router.post('/admin/filterdate',salesConroller.filterDate)
Router.get("/admin/salesReport/download/xlsx",salesConroller.salesReportDownload);
Router.get('/admin/salesReport/download/pdf',salesConroller.salesReportDownloadPDF)
Router.get('/removefilter',salesConroller.removeAllFillters)
Router.post('/admin/salesReport/filter',salesConroller.filterDates)
module.exports=Router