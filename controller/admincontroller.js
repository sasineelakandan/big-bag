
const usercollection = require('../model/usermodel')
const categorycollection = require('../model/categorymodel')
const productCollection=require('../model/productmodel')
const orderCollection=require('../model/ordermodel')
const categoryCollection=require('../model/categorymodel')
const AppError=require('../middlewere/errorhandling')
const dashboardHelper=require('../services/dashbordhalper')
const loginpage = async (req, res,next) => {
    try {
        if (req.session.admin) {
            const category=await categorycollection.find({})
            const Product=await productCollection.find({})
            const users=await usercollection.find({})
            
           const products=await orderCollection.find({orderStatus:'Delivered'}).sort({_id:-1})
           const totalcount = products.reduce((total, item) => total + item.Total, 0);

            res.render('adminpages/adminhome',{orderDet:products,category,Product,users,totalcount})
        } else {
            res.render('adminpages/adminlogin')
        }

    } catch (err) {
        next(new AppError('Somthing went Wrong', 500));
    }

}

const adminlogin = async (req, res,next) => {
    try {
        if (req.body.email == process.env.ADMINEMAIL && req.body.password == process.env.ADMIN_PASS) {
            req.session.admin = true
            res.send({ success: true })
        } else {
            res.send({ invalidPass: true })
        }
    } catch (err) {
        next(new AppError('Somthing went Wrong', 500));
    }

}
const adminlogout = async (req, res,next) => {
    try {
        req.session.admin = false
        res.redirect('/admin')
    } catch (err) {
        next(new AppError('Somthing went Wrong', 500));
    }

}

const usermanagement = async (req, res,next) => {
    try {
        let Users=req.session.search|| await usercollection.find()
        const productsPerPage = 8
        const totalPages = Users.length / productsPerPage
        const pageNo = req.query.pages || 1
        const start = (pageNo - 1) * productsPerPage
        const end = start + productsPerPage
        Users = Users.slice(start, end)
        req.session.search=null 
        res.render('adminpages/usermanagement', { userdet: Users,totalPages })
    } catch (err) {
        next(new AppError('Somthing went Wrong', 500));
    }
}


const userblock = async (req, res,next) => {
    try {
        let userblock
        if (req.query.action == 'unblock') {
            userblock = false
        } else {
            userblock = true
        }
        await usercollection.updateOne({ _id: req.query.id }, { $set: { isBlocked: userblock } })
        res.send({ userstat: userblock })
    } catch (err) {
        next(new AppError('Somthing went Wrong', 500));
    }
}
const usersearch = async (req, res,next) => {
    

    try {
        const searchuser = await usercollection.find({ name: { $regex: req.body.search, $options: 'i' } })
        req.session.search = searchuser
        res.redirect('/admin/usermanagement')
    } catch (error) {
        next(new AppError('Somthing went Wrong', 500));
    }

}
const dashboardData = async (req, res) => {
    try {
      const [
      
        currentDayRevenue,
        fourteenDaysRevenue,
        categoryWiseRevenue,
        TotalRevenue,
        MonthlyRevenue,
       
      ] = await Promise.all([
       
        dashboardHelper.currentDayRevenue(),
        dashboardHelper.fourteenDaysRevenue(req.query.filter),
        dashboardHelper.categoryWiseRevenue(req.query.filter),
        dashboardHelper.Revenue(),
        dashboardHelper.MonthlyRevenue(),
     
      ]);
  
      const data = {
        
        currentDayRevenue,
        fourteenDaysRevenue,
        categoryWiseRevenue,
        TotalRevenue,
        MonthlyRevenue,
       
      };
  
      res.json(data);
    } catch (error) {
      console.log(error);
    }
  };


     
const topProduct = async (req, res,next) => {
    try {
      const topProducts = await orderCollection.aggregate([
        {
          $match: { orderStatus: 'Delivered' }
        },
        {
          $unwind: '$cartData'
        },
        {
          $group: {
            _id: '$cartData.productId',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        },
        {
          $limit: 5
        },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'product'
          }
        },
        {
          $unwind: '$product'
        },
        {
          $project: {
            _id: 0,
            productId: '$_id',
            count: 1,
            productName: '$product.productName',
            productPrice: '$product.productPrice'
          }
        }
      ]);
      
     res.render('adminpages/top 3 products',{topProducts})
     
   }
   catch(error){
    next(new AppError('Sorry...Something went wrong', 500));
   } 
}
const topCategory = async (req, res,next) => {
    try {
      const topCategories = await orderCollection.aggregate([
        {
          $match: { orderStatus: 'Delivered' }
        },
        {
          $unwind: '$cartData'
        },
        {
          $lookup: {
            from: 'products',
            localField: 'cartData.productId',
            foreignField: '_id',
            as: 'product'
          }
        },
        {
          $unwind: '$product'
        },
        {
          $lookup: {
            from: 'categories',
            localField: 'product.parentCategory',
            foreignField: '_id',
            as: 'category'
          }
        },
        {
          $unwind: '$category'
        },
        {
          $group: {
            _id: '$category.categoryname',
            quantity: { $sum: 1 }
          }
        },
        {
          $sort: { quantity: -1 }
        },
        {
          $limit: 10
        }
      ]);
     console.log(topCategories)
      res.render('adminpages/Top3category', { topCategories });
    } catch (err) {
      // Consider using a centralized error handler
      next(new AppError('Sorry...Something went wrong', 500));
      res.status(500).send({ success: false, message: 'Internal Server Error' });
    }
  };
  

module.exports = { adminlogin, loginpage, adminlogout, usermanagement, userblock, usersearch,dashboardData,topProduct,topCategory,

}