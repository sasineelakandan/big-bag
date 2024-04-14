const productCollection=require('../model/productmodel')
const categorycollection=require('../model/categorymodel')





const productUpdate=async(req,res)=>{
   
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
const productEdit=async(req,res)=>{
    try {
        
        const categoryDetail = await categorycollection.find()
        const categoryDet = await categorycollection.findOne({ _id: req.query.cid })
        const productDet = await productCollection.findOne({ _id: req.query.pid })
        
        res.render('adminpages/productedit', { categoryDet, productDet, categoryDetail })
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
const Product=async(req,res)=>{
    try{
        const productDetails = await productCollection.find().populate('parentCategory').sort({ _id: -1 })
        
        res.render('adminpages/product',{productDet:productDetails})
    }
    catch(error){
        console.log(error)
    }
}
const addProduct=async(req,res)=>{
    try{
        
        const categoryDetails = await categorycollection.find()
        res.render('adminpages/addproduct',{categorydet:categoryDetails})
    }
    catch(error){
        console.log(error)
    }
}
const addProduct2=async(req,res)=>{
    
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
const deleteImage = async (req, res) => {
    try {
    
      const updatedProduct = await productCollection.findOne({
        _id: req.body.productId,
      });
      if (!updatedProduct) {
        return res.status(404).json({ error: "Product not found" }); // Remove the first element
      }
      if (
        req.body.index >= 0 &&
        req.body.index < updatedProduct.productImage.length
      ) {
        updatedProduct.productImage[req.body.index] = null;
        await updatedProduct.save();
        res.status(200).json({
          message: "Image deleted successfully",
          product: updatedProduct,
        });
      } else {
        res.status(400).json({ error: "Invalid image index" })
      }
    } catch (error) {
      console.log(
        "Error in deleteing the Image through the Edit product delete button " +
          error
      );
    }
  };
  
    
  

module.exports={addProduct2,addProduct,Product,productList,productEdit,productUpdate,deleteImage}
