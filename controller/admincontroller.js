
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
        let Users= await usercollection.find()
        const productsPerPage = 5
        const totalPages = Users.length / productsPerPage
        const pageNo = req.query.pages || 1
        const start = (pageNo - 1) * productsPerPage
        const end = start + productsPerPage
        Users = Users.slice(start, end)
          
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
        res.redirect('/usermanagement')
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
        dashboardHelper.fourteenDaysRevenue(),
        dashboardHelper.categoryWiseRevenue(),
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




module.exports = { adminlogin, loginpage, adminlogout, usermanagement, userblock, usersearch,dashboardData

}