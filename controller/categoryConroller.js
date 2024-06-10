const categoryCollection=require('../model/categorymodel')
const productCollection=require('../model/productmodel')
const AppError=require('../middlewere/errorhandling')
const categoryManagement = async (req, res,next) => {
    try {
        let category = await categoryCollection.find()
        const productsPerPage = 2
        const totalPages = category.length / productsPerPage
        const pageNo = req.query.pages || 1
        const start = (pageNo - 1) * productsPerPage
        const end = start + productsPerPage
        category = category.slice(start, end)
        res.render('adminpages/category', { categorydet: category ,totalPages})
    }
    catch (error) {
      next(new AppError('Somthing went Wrong', 500));
    }
}
const addCategory = async (req, res,next) => {
    try {
        const newcategory = new categoryCollection({
            categoryname: req.body.categoryname,
            categorydescription: req.body.categorydes
        })

        const catExists = await categoryCollection.findOne({
            categoryname: { $regex: new RegExp('^' + req.body.categoryname + '$', 'i') }
        });
         
          

        if (catExists) {
            
            res.send({ invalid: true })
        } else {
            newcategory.save()
            res.send({ success: true })
        }

    } catch (err) {
      next(new AppError('Somthing went Wrong', 500));
    }
}
const categoryList = async (req, res,next) => {
    try {
        let catList
        if (req.query.action === 'list') {
            catList = true
        } else {
            catList = false
        }
        await productCollection.updateMany({ parentCategory: req.query.id }, { $set: { isListed: catList } })
        await categoryCollection.updateOne({ _id: req.query.id }, { $set: { isListed: catList } })
        res.send({ list: catList })
    } catch (err) {
      next(new AppError('Somthing went Wrong', 500));
    }
}
const editCategory = async (req, res,next) => {

    try {
        
        let categorydetail = await categoryCollection.findById({ _id: req.params.id })
        res.render('adminpages/adminedit', { categorydetail })
    }
    catch (error) {
      next(new AppError('Somthing went Wrong', 500));


    }
}


const updateCategory = async (req, res,next) => {
    try {
       
        
        const catDetails = await categoryCollection.findOne({
          categoryname: {
            $regex: new RegExp(
              "^" + req.body.categoryName.toLowerCase() + "$",
              "i"
            ),
          },
        });
        
        if (
          /^\s*$/.test(req.body.categoryName) ||
          /^\s*$/.test(req.body.categoryDes)
        ) {
          res.send({ noValue: true });
          
        } else if (catDetails && (catDetails._id != req.body.categoryId)) {
          res.send({ exists: true });
        } else {
          await categoryCollection.updateOne(
            { _id: req.body.categoryId },
            {
              $set: {
                categoryname: req.body.categoryName,
                categorydescription: req.body.categoryDes,
              },
            }
          );
          res.send({ success: true });
        }
      } catch (err) {
        next(new AppError('Somthing went Wrong', 500));
      }
    };


module.exports={editCategory,categoryList,addCategory,categoryManagement,updateCategory}