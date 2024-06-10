const productCollection=require('../model/productmodel')
const categorycollection=require('../model/categorymodel')
const AppError=require('../middlewere/errorhandling')




const productUpdate=async(req,res,next)=>{
   
    try {
        const croppedImages = req.files.filter(file => file.fieldname.startsWith('croppedImage'));
        const images = croppedImages.map(file => file.filename); 
            
            const existingProduct = await productCollection.findOne({ _id: req.params.id });
            var imgFiles = existingProduct.productImage;
        
        
            for (let i = 0; i <images.length; i++) {
            
                imgFiles.push(images[i]);
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
        next(new AppError('Somthing went Wrong', 500));
    }
}
const productEdit=async(req,res,next)=>{
    try {
        
        const categoryDetail = await categorycollection.find()
        const categoryDet = await categorycollection.findOne({ _id: req.query.cid })
        const productDet = await productCollection.findOne({ _id: req.query.pid })
        
        res.render('adminpages/productedit', { categoryDet, productDet, categoryDetail })
    } catch (err) {
        next(new AppError('Somthing went Wrong', 500));;
    }
}
const productList = async (req, res,next) => {
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
        next(new AppError('Somthing went Wrong', 500));
    }
}
const deleteProduct=async(req,res,next)=>{
    try{
        let deleted
        
        if(req.query.action==='delete'){
            deleted=true
        }else{
            deleted=false
        }
        await productCollection.updateOne({_id:req.query.id},{$set:{isDelete:deleted}})
        res.send({del:deleted})
    }catch(err){
        next(new AppError('Somthing went Wrong', 500));
    
    }
  
  }
const Product=async(req,res,next)=>{
    try{
        let productDetails = await productCollection.find({isDelete:false}).populate('parentCategory').sort({ _id: -1 })
        const productsPerPage = 5
      const totalPages = productDetails.length / productsPerPage
      const pageNo = req.query.pages || 1
      const start = (pageNo - 1) * productsPerPage
      const end = start + productsPerPage
      productDetails = productDetails.slice(start, end)
        res.render('adminpages/product',{productDet:productDetails,totalPages})
    }
    catch(error){
        next(new AppError('Somthing went Wrong', 500));
    }
}
const addProduct=async(req,res,next)=>{
    try{
        
        const categoryDetails = await categorycollection.find({isListed:true})
        res.render('adminpages/addproduct',{categorydet:categoryDetails})
    }
    catch(error){
        next(new AppError('Somthing went Wrong', 500));
    }
}
const addProduct2=async(req,res,next)=>{
    
    try {
        const croppedImages = req.files.filter(file => file.fieldname.startsWith('croppedImage'));
        const images = croppedImages.map(file => file.filename); 
        const addproduct = new productCollection({
            productName: req.body.productName,
            parentCategory: req.body.parentCategory,
            productImage: images,
            productPrice: req.body.productPrice,
            priceBeforeOffer:req.body.productPrice,
            productStock: req.body.productStock,
            productDiscription:req.body.productdes
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
        next(new AppError('Somthing went Wrong', 500));
    }
}
const deleteImage = async (req, res,next) => {
    try {
        
   const  deletedProduct= await productCollection.findOne({_id:req.body.productId})
   if (
    req.body.index >= 0 &&
    req.body.index < deletedProduct.productImage.length
  ) {
    deletedProduct.productImage.splice(req.body.index, 1);
    await deletedProduct.save();
    res.status(200).json({
      message: "Image deleted successfully",
      product: deletedProduct,
    });;
  } else {
    res.status(400).json({ error: "Invalid image index" })
  }
    } catch (error) {
        next(new AppError('Somthing went Wrong', 500));
    }
  };

    
  

module.exports={addProduct2,addProduct,Product,productList,productEdit,productUpdate,deleteImage,deleteProduct,}
