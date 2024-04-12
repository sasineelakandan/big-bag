const crtegoryCollection=require('../model/categorymodel')
const categoryManagement = async (req, res) => {
    try {
        const category = await categorycollection.find()
        res.render('adminpages/category', { categorydet: category })
    }
    catch (error) {
        console.log(error)
    }
}
const addCategory = async (req, res) => {
    try {
        const newcategory = new categorycollection({
            categoryname: req.body.categoryname,
            categorydescription: req.body.categorydes
        })

        const catExists = await categorycollection.findOne({
            categoryname: { $regex: new RegExp('^' + req.body.categoryname + '$', 'i') }
        });

        if (catExists) {
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
        await categorycollection.updateOne({ _id: req.query.id }, { $set: { isListed: catList } })
        res.send({ list: catList })
    } catch (err) {
        console.log(err);
    }
}
const editCategory = async (req, res) => {

    try {
        let categorydetail = await categorycollection.findById({ _id: req.params.id })
        res.render('adminpages/adminedit', { categorydetail })
    }
    catch (error) {
        console.log(error)


    }
}
const updateCategory = async (req, res) => {
    try {
       
        const { category, categorydes } = req.body
       
        const prodet=await categorycollection.findOne({_id:req.params.id})
        if(category==prodet.categoryname&&categorydes==prodet.categorydescription){
            
            res.send({ catexists: true })
            
        } else {
        
            
            let cat = await categorycollection.findByIdAndUpdate({ _id: req.params.id }, { $set: { categoryname: category, categorydescription:categorydes } })
            
            res.send({ success: true })
        }
    }
    catch (error) {
        console.log("This is the error edit submit" + error)
    }
}

module.exports={updateCategory,editCategory,categoryList,addCategory,categoryManagement }