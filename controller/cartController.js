const productCollection=require('../model/productmodel')
const categoryCollection=require('../model/categorymodel')
const addressCollection=require('../model/addressmodel')
const usercollection=require('../model/usermodel')
const cartCollection=require('../model/cartmodel')
const orderCollection=require('../model/ordermodel')



const Cart=async(req,res)=>{
    try{
        
        const cart= await cartCollection.find({userId:req.query.user}).populate('productId')
         
         Sum=0
         for(let i=0;i<cart.length;i++){
          Sum=Sum+cart[i].totalCostPerProduct
         }
        
     
              
        res.render('userpages/cart',{userLogged:req.session.logged,cartDet:cart,grandTotal:Sum})
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
             
           if(totaqty<=productStock){
            
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
      const qty2=await productCollection.findOne({ _id: req.query.pid})
           const qtyy=Number(req.query.quantity)
      if(qtyy<=qty2.productStock){
        const newcart = new cartCollection({
            userId:req.query.user,
            productId:req.query.pid ,
            productQuantity:req.query.quantity, 
            productStock:req.query.stock,
            productprice:req.query.productPrice,
            Status:'pending',
            totalCostPerProduct:req.query.total,
            productImage:req.query.Img,
            productName:req.query.productname
        })
        newcart.save()
        res.send({success:true})
      }else{
        res.send({success:false})
      }
    }
}
    catch(error){
        console.log(error)
    }
}
 const cartbutton=async(req,res)=>{
   
        try {
          
          const user=req.query.user
      
          const productId = req.query.id;
          const action=req.query.action
          const index=req.query.index
         
        
          const quantity = Number(req.query.quantity);
          
  


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
              
                const cart= await cartCollection.find({userId:user}).populate('productId')
         
                Sum=0
                for(let i=0;i<cart.length;i++){
                 Sum=Sum+cart[i].totalCostPerProduct
                }
               
                  
                // Send success response with updated cart product
                res.send({ success: true, cartProduct:cartProduct.productQuantity,Stock:productStock,Total:total,grandTotal:Sum});
    
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
            const cart= await cartCollection.find({userId:user}).populate('productId')
         
            Sum=0
            for(let i=0;i<cart.length;i++){
             Sum=Sum+cart[i].totalCostPerProduct
            }
           
               
                   // Return the updated document
                
                // Send success response with updated cart product
                res.send({ min: true, cartProduct:cartProduct.productQuantity,Stock:productStock,Total:cartProduct.totalCostPerProduct,grandTotal:Sum});
    
              }else {
                res.status(400).send({ success: false, exp: true });
              }
            
         }
         
          
        } catch (error) {
          console.log("Error while clicking the Cart Increment Button:", error);
          res.status(500).send({ success: false, message: "Internal server error" });
        }
      };
     const checkOut1=async(req,res)=>{

      try{
        const cart= await cartCollection.find({userId:req.query.user}).populate('productId')
         
        Sum=0
        for(let i=0;i<cart.length;i++){
         Sum=Sum+cart[i].totalCostPerProduct
        }
        req.session.grandTotal=Number(Sum)
        const address= await addressCollection.find({userId:req.query.user})
        
        res.render('userpages/shippingAddress',{userLogged:req.session.logged,grandTotal:req.session.grandTotal,addressDet:address})
      }
      catch(error){
        console.log(error)
      }
     }
     const checkOut2=async(req,res)=>{
      try{
        const useraddress= await addressCollection.findOne({_id:req.query.id})
        
        const usercart=await cartCollection.find({userId:req.query.user})
        const grandTotal=Number(req.session.grandTotal)
        const shippingfee=(100)
        
        const gst=Math.round(grandTotal*0.18)
        
        const total=grandTotal+gst

         res.render('userpages/checkout2',{userLogged:req.session.logged,userDet:useraddress,usercartDet:usercart,grandTotal:req.session.grandTotal,Total:total,Gst:gst,Charge:shippingfee})
      }
      catch(error){
        console.log(error)
      }
     }
     const checkOut3=async(req,res)=>{
      try{
        
        const useraddress= await addressCollection.findOne({_id:req.query.id})
        
      
        const usercart=await cartCollection.find({userId:req.query.user})
        const grandTotal=Number(req.session.grandTotal)
        
        
        const gst=Math.round(grandTotal*0.18)
        
        const total=grandTotal+gst

         res.render('userpages/checkout3',{userLogged:req.session.logged,userDet:useraddress,usercartDet:usercart,grandTotal:req.session.grandTotal,Total:total,Gst:gst})
      }
      catch(error){
        console.log(error)
      }
     }
     const checkOut4=async(req,res)=>{
      try{
        const usercart=await cartCollection.find({userId:req.query.id})
        var count=0
        for(let i=0;i<usercart?.length;i++){
         var cartData=usercart[i]?._id
            count++
        }
       
       console.log(count)
    
        for (let i = 0; i < usercart?.length; i++) {
          await productCollection.updateOne(
            { _id: usercart[i].productId },
            { $inc: { productStock: -usercart[i].productQuantity } }
          );
        }
        await cartCollection.deleteMany({userId:req.query.id})

        const newOrder = new orderCollection({
          userId:req.query.id,
          paymentType:'COD',
          address:req.query.addressId,
          grandTotalCost:req.query.Grandtotal,
          cartData:usercart,
          Items:count,
          Gst:req.query.gst,
        
          Total:req.query.total
      })
      newOrder.save()
    
      res.send({success:true})
         
        
         
      }
      catch(error){
        console.log(error)
      }
     }
     const checkOut5=async(req,res)=>{
      try{
        
         const orderDet= await orderCollection.findOne({userId:req.session.logged._id})
         
         const address=orderDet.address
         
         const add=await addressCollection.findOne({_id:address})
         
         res.render('userpages/checkout4',{userLogged:req.session.logged,Order:orderDet,addressDet:add})
      }
      catch(error){
        console.log(error)
      }
     }
    const removeCart =async(req,res)=>{
      try{
        await cartCollection.deleteOne({_id:req.query.id})
        res.send({success:true})
      }
      catch(error){
        console.log(error)
      }
    } 

module.exports={Cart, addTocart,cartbutton,checkOut1,checkOut2,checkOut3,checkOut4,checkOut5,removeCart}