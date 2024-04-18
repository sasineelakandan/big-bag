const categoryCollection=require('../model/categorymodel')
const productCollection=require('../model/productmodel')
const categoryManagement = async (req, res) => {
    try {
        const category = await categoryCollection.find()
        res.render('adminpages/category', { categorydet: category })
    }
    catch (error) {
        console.log(error)
    }
}
const addCategory = async (req, res) => {
    try {
        const newcategory = new categoryCollection({
            categoryname: req.body.categoryname,
            categorydescription: req.body.categorydes
        })

        const catExists = await categoryCollection.findOne({
            categoryname: { $regex: new RegExp('^' + req.body.categoryname + '$', 'i') }
        });
         
          

        if (catExists) {
            console.log(catExists)
            res.send({ invalid: true })
        } else {
            newcategory.save()
            res.send({ success: true })
        }

    } catch (err) {
        console.log(err);
    }
}
const categoryList = async (req, res) => {
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
        console.log(err);
    }
}
const editCategory = async (req, res) => {

    try {
        console.log(req.params.id)
        let categorydetail = await categoryCollection.findById({ _id: req.params.id })
        res.render('adminpages/adminedit', { categorydetail })
    }
    catch (error) {
        console.log(error)


    }
}


const updateCategory = async (req, res) => {
    try {
       console.log(req.body)
        
        const catDetails = await categoryCollection.findOne({
          categoryname: {
            $regex: new RegExp(
              "^" + req.body.categoryName.toLowerCase() + "$",
              "i"
            ),
          },
        });
        console.log(catDetails)
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
        console.log(err);
      }
    };


module.exports={editCategory,categoryList,addCategory,categoryManagement,updateCategory}