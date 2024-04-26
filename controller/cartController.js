const productCollection=require('../model/productmodel')
const categoryCollection=require('../model/categorymodel')
const addressCollection=require('../model/addressmodel')
const usercollection=require('../model/usermodel')
const cartCollection=require('../model/cartmodel')


const Cart=async(req,res)=>{
    try{
        
        const cart= await cartCollection.find().populate('productId')
        const  grandTotal= await cartCollection.aggregate([{$group:{_id:0,sum:{$sum:'$totalCostPerProduct'}}}])
                const totalSum = grandTotal[0].sum;
        res.render('userpages/cart',{userLogged:req.session.logged,cartDet:cart,grandTotal:totalSum})
    }
    catch(error){
        console.log(error)
    }
}
const addTocart=async(req,res)=>{
    try{
        const productExist = await cartCollection.findOne({
            userId: req.session.logged._id,
            productId: req.query.pid,
           
            
          });
         
          if(productExist){
            const presentQty = parseInt(productExist.productQuantity);
            const qty = parseInt(req.query.quantity);
            const productPrice = parseInt(req.query.productPrice);
            const productStock=parseInt(req.query.stock)
           const totaqty=presentQty + qty
             
           if(totaqty<productStock){
            
              await cartCollection.updateOne(
              { productId: req.query.pid },
              {
                $set: {
                  productQuantity: totaqty,
                  totalCostPerProduct:(presentQty + qty )* productPrice,
                },
              }
            );
            res.send({success:true})
          }else{
            res.send({success:false})
          }
        }
    if(!productExist){
        const newcart = new cartCollection({
            userId:req.query.user,
            productId:req.query.pid ,
            productQuantity:req.query.quantity, 
            productStock:req.query.stock,
            productprice:req.query.productPrice,
            totalCostPerProduct:req.query.total,
            productImage:req.query.Img
        })
        newcart.save()
        res.send({success:true})
    }
}
    catch(error){
        console.log(error)
    }
}
 const cartbutton=async(req,res)=>{
   
        try {
          const productId = req.query.id;
          const action=req.query.action
          const index=req.query.index
        
          const quantity = Number(req.query.quantity);
          console.log('qty from query: '+quantity);


          // Retrieve the product from the database
          const product = await productCollection.findOne({ _id: productId });
          if (!product) {
            return res
              .status(404)
              .send({ success: false, message: "Product not found" });
          }
      
          const productStock = parseInt(product.productStock);
          const productPrice=parseInt(product.productPrice)
          
          if(action=='plus'){
            if (productStock>quantity) {
              let total =(1+quantity)*productPrice
              
              
               
                 const cartProduct = await cartCollection.findOneAndUpdate(
                  { productId },
                  { 
                      $inc: { productQuantity: 1 },
                      $set: { totalCostPerProduct: total }
                  },
                  { 
                      new: true // Return the updated document
                  }
                );
                const  grandTotal= await cartCollection.aggregate([{$group:{_id:0,sum:{$sum:'$totalCostPerProduct'}}}])
                const totalSum = grandTotal[0].sum;
                
                  
                // Send success response with updated cart product
                res.send({ success: true, cartProduct:cartProduct.productQuantity,Stock:productStock,Total:total,grandTotal:totalSum});
    
              }else {
                res.status(400).send({ success: false, exceed: true });
              }
            
         }
         if(action=='min'){
            if (quantity >1 ) {
                // If quantity is less than productStock, update the cart
               
               const productprice=((quantity-1)*productPrice)
               const cartProduct = await cartCollection.findOneAndUpdate(
                { productId },
                { 
                    $inc: { productQuantity: -1 },
                    $set: { totalCostPerProduct: productprice }
                },
                { 
                    new: true // Return the updated document
                }
            );
            
            const  grandTotal= await cartCollection.aggregate([{$group:{_id:0,sum:{$sum:'$totalCostPerProduct'}}}])
            const totalSum = grandTotal[0].sum;
            
               
                   // Return the updated document
                
                // Send success response with updated cart product
                res.send({ min: true, cartProduct:cartProduct.productQuantity,Stock:productStock,Total:cartProduct.totalCostPerProduct,grandTotal:totalSum});
    
              }else {
                res.status(400).send({ success: false, exp: true });
              }
            
         }
         
          
        } catch (error) {
          console.log("Error while clicking the Cart Increment Button:", error);
          res.status(500).send({ success: false, message: "Internal server error" });
        }
      };

module.exports={Cart, addTocart,cartbutton}