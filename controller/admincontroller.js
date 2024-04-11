
const usercollection = require('../model/usermodel')
const categorycollection = require('../model/categorymodel')
const productCollection=require('../model/productmodel')


const loginpage = async (req, res) => {
    try {
        if (req.session.admin) {
            res.render('adminpages/adminhome')
        } else {
            res.render('adminpages/adminlogin')
        }

    } catch (err) {
        console.log(err);
    }

}

const adminlogin = async (req, res) => {
    try {
        if (req.body.email == process.env.ADMINEMAIL && req.body.password == process.env.ADMIN_PASS) {
            req.session.admin = true
            res.send({ success: true })
        } else {
            res.send({ invalidPass: true })
        }
    } catch (err) {
        console.log(err);
    }

}
const adminlogout = async (req, res) => {
    try {
        req.session.admin = false
        res.redirect('/admin')
    } catch (err) {
        console.log(err);
    }

}

const usermanagement = async (req, res) => {
    try {
        let userdetail;
        if (req.session.search) {
            userdetail = req.session.search
            req.session.search = null
            req.session.save()
        } else {
            userdetail = await usercollection.find()
        }
        res.render('adminpages/usermanagement', { userdet: userdetail })
    } catch (err) {
        console.log(err);
    }
}


const userblock = async (req, res) => {
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
        console.log(err);
    }
}
const usersearch = async (req, res) => {
    

    try {
        const searchuser = await usercollection.find({ name: { $regex: req.body.search, $options: 'i' } })
        req.session.search = searchuser
        res.redirect('/usermanagement')
    } catch (error) {
        console.log(error)
    }

}
const categorymanagement = async (req, res) => {
    try {
        const category = await categorycollection.find()
        res.render('adminpages/category', { categorydet: category })
    }
    catch (error) {
        console.log(error)
    }
}
const addcategory = async (req, res) => {
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
const categorylist = async (req, res) => {
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
const editcategory = async (req, res) => {

    try {
        let categorydetail = await categorycollection.findById({ _id: req.params.id })
        res.render('adminpages/adminedit', { categorydetail })
    }
    catch (error) {
        console.log(error)


    }
}
const updatecategory = async (req, res) => {
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
const product=async(req,res)=>{
    try{
        const productDetails = await productCollection.find().populate('parentCategory').sort({ _id: -1 })
      
        res.render('adminpages/product',{productDet:productDetails})
    }
    catch(error){
        console.log(error)
    }
}
const addproduct=async(req,res)=>{
    try{
        
        const categoryDetails = await categorycollection.find()
        res.render('adminpages/addproduct',{categorydet:categoryDetails})
    }
    catch(error){
        console.log(error)
    }
}
const addproduct2=async(req,res)=>{
    
    try {
        let imgFiles = []
        for (let i = 0; i < req.files.length; i++) {
            imgFiles[i] = req.files[i].filename
        }

        const addproduct = new productCollection({
            productName: req.body.productName,
            parentCategory: req.body.parentCategory,
            productImage: imgFiles,
            productPrice: req.body.productPrice,
            productStock: req.body.productStock
        })
        const productDetails = await productCollection.find({ productName: { $regex: new RegExp('^' + req.body.productName.toLowerCase() + '$', 'i') } })
        if (/^\s*$/.test(req.body.productName) || /^\s*$/.test(req.body.productPrice) || /^\s*$/.test(req.body.productStock)) {
            res.send({ noValue: true })
        }
        else if (productDetails.length > 0) {
            res.send({ exists: true })
        } else {
            res.send({ success: true })
            addproduct.save()
        }

    } catch (err) {
        console.log(err);
    }
}
const productList = async (req, res) => {
    try {
        let productList
        if (req.query.action === 'list') {
            productList = false
        } else {
            productList = true
        }
        await productCollection.updateOne({ _id: req.query.id }, { $set: { isListed: productList } })
        res.send({ list: productList })
    } catch (err) {
        console.log(err);
    }
}
const productedit=async(req,res)=>{
    try {
        
        const categoryDetail = await categorycollection.find()
        const categoryDet = await categorycollection.findOne({ _id: req.query.cid })
        const productDet = await productCollection.findOne({ _id: req.query.pid })
        
        res.render('adminpages/productedit', { categoryDet, productDet, categoryDetail })
    } catch (err) {
        console.log(err);
    }
}
const productupdate=async(req,res)=>{
   
    try {
        if (req.files.length === 0) {
            const existingProduct = await productCollection.findOne({ _id: req.params.id });
            var imgFiles = existingProduct.productImage;
        }else if (req.files.length < 3) {
            res.send({ noImage: true })
        } else{
            var imgFiles = []
            for (let i = 0; i < req.files.length; i++) {
                imgFiles[i] = req.files[i].filename
            }
        }
         
        const productDetails = await productCollection.find({ _id: { $ne: req.params.id }, productName: { $regex: new RegExp('^' + req.body.productName.toLowerCase() + '$', 'i') } })
        if (/^\s*$/.test(req.body.productName) || /^\s*$/.test(req.body.productPrice) || /^\s*$/.test(req.body.productStock)) {
            res.send({ noValue: true })
        }
     
        else if (productDetails.length > 0 && req.body.productName != productDetails.productName) {
            res.send({ exists: true })
        } else {
            await productCollection.updateOne({ _id: req.params.id }, {
                $set: {
                    productName: req.body.productName,
                    parentCategory: req.body.parentCategory,
                    productImage: imgFiles,
                    productPrice: req.body.productPrice,
                    productStock: req.body.productStock
                }
            })
            res.send({ success: true })

        }

    } catch (err) {
        console.log(err);
    }
}



module.exports = { adminlogin, loginpage, adminlogout, usermanagement, userblock, usersearch, categorymanagement, addcategory, categorylist, editcategory, updatecategory,product,addproduct,
addproduct2 ,productList,productedit,productupdate
}