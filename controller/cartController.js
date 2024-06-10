const productCollection=require('../model/productmodel')
const categoryCollection=require('../model/categorymodel')
const addressCollection=require('../model/addressmodel')
const usercollection=require('../model/usermodel')
const cartCollection=require('../model/cartmodel')
const orderCollection=require('../model/ordermodel')
const walletCollection=require('../model/Walletmodel')
const couPonCollection=require('../model/Couponmodel')
const AppError=require('../middlewere/errorhandling')

const Cart=async(req,res,next)=>{
    
      
     
      try {
        const cartData = await cartCollection.find({ userId: req.session.logged._id}).populate('productId');
        if(cartData.length==0){
          
          res.render('userpages/emptyCart', { userLogged: req.session.logged, cartDet:cartData,  });
        }else{
        let totalItems = 0;
        let grandTotal = 0;
        let outOfStockItems = [];
    
        
        for (const item of cartData) {
          const product = item.productId;
    
          if (product.productStock < item.productQuantity) {
      
            outOfStockItems.push({ productName: product.productName, requestedQuantity: item.productQuantity, availableQuantity: product.productStock });
    
            
            await cartCollection.updateOne({ _id: item._id }, { $set: { productQuantity: product.productStock, totalCostPerProduct: product.productStock * product.productPrice } });
    
            item.productQuantity = product.productStock;
            item.totalCostPerProduct = product.productStock * product.productPrice;
          }
    
          totalItems += item.productQuantity;
          grandTotal += item.totalCostPerProduct;
          req.session.Sum = grandTotal;
          req.session.grandTotal = grandTotal
        }
    
        res.render("userpages/cart", { userLogged: req.session.logged,cartDet:cartData, totalItems, grandTotal, outOfStockItems });
      }
      
    
      

    
  }  catch(error){
      next(new AppError(error, 500));
    }
}
const addTocart=async(req,res,next)=>{
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
      
      const qty2 = await productCollection.findOne({ _id: req.query.pid });
           const qtyy=Number(req.query.quantity)
          
      if(qtyy<=qty2.productStock){
      let total=qtyy*qty2.productPrice
        const newcart = new cartCollection({
            userId:req.session.logged._id,
            productId:req.query.pid ,
            productQuantity:req.query.quantity, 
            productStock:req.query.stock,
            productprice:qty2.productPrice,
            priceBeforeOffer:qty2.priceBeforeOffer,
            productOfferPercentage:qty2.productOfferPercentage,
            Status:'pending',
            totalCostPerProduct:total,
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
      next(new AppError('Somthing went Wrong', 500));
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
        
        console.log(total)
         
           const cartProduct = await cartCollection.findOneAndUpdate(
            { productId,userId:user },
            { 
                $inc: { productQuantity: 1 },
                $set: { totalCostPerProduct: total }
            },
            { 
                new: true 
            }
          );
        
          const cart= await cartCollection.find({userId:user}).populate('productId')
   
          Sum=0
          for(let i=0;i<cart.length;i++){
           Sum=Sum+cart[i].totalCostPerProduct
          }
         
            
        
          res.send({ success: true, cartProduct:cartProduct.productQuantity,Stock:productStock,Total:total,grandTotal:Sum});

        }else {
          res.status(400).send({ success: false, exceed: true });
        }
      
   }
   if(action=='min'){
      if (quantity >1 ) {
          
         
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
   


    
     const checkOut1=async(req,res,next)=>{

      try{
        const cart= await cartCollection.find({userId:req.query.user}).populate('productId')
         
       
        const address= await addressCollection.find({userId:req.query.user})
        
        res.render('userpages/shippingAddress',{userLogged:req.session.logged,grandTotal:req.session.grandTotal,addressDet:address})
      }
      catch(error){
        next(new AppError('Somthing went Wrong', 500));
      }
     }
     const checkOut2=async(req,res,next)=>{
      try{
        const useraddress= await addressCollection.findOne({_id:req.query.id})
        const coupon=await couPonCollection.find({isDelete:false})
        const usercart=await cartCollection.find({userId:req.query.user})
        const grandTotal=Number(req.session.grandTotal)
        
        
        
        
        const total=grandTotal

         res.render('userpages/checkout2',{userLogged:req.session.logged,userDet:useraddress,usercartDet:usercart,grandTotal:req.session.grandTotal,Total:total,couponDet:coupon,Discount:req.session.copponAplied,subTotal: req.session.Sum})
      }
      catch(error){
        next(new AppError('Somthing went Wrong', 500));
      }
     }
     const checkOut3=async(req,res,next)=>{
      try{
       
          
         res.send({success:true})
      }
      catch(error){
        next(new AppError('Somthing went Wrong', 500));
      }
     }
     const checkOut4=async(req,res,next)=>{
      try{
        req.session.add=req.query.addressId
       
     if(req.query.pm=='paypal'){
        
          res.send({paypal:true})

     } if(req.query.pm==='Cash on Delivery'){
      if(req.query.total>1000){
        res.send({bigAmount:true})
      }else{
        const usercart=await cartCollection.find({userId:req.query.id})
        var count=0
        for(let i=0;i<usercart?.length;i++){
         var cartData=usercart[i]?._id
            count++
        }
       
      
    
        for (let i = 0; i < usercart?.length; i++) {
          await productCollection.updateOne(
            { _id: usercart[i].productId },
            { $inc: { productStock: -usercart[i].productQuantity } }
          );
        }

        const coupan=await couPonCollection.findOne({discountPercentage:req.session.copponAplied})
        await cartCollection.deleteMany({userId:req.query.id})
        const orderId = Math.floor(100000 + Math.random() * 900000);
        const newOrder = new orderCollection({
          OrderId:orderId,
          userId:req.query.id,
          UserName:req.session.logged.name,
          paymentType:'COD',
          address:req.query.addressId,
          grandTotalCost:req.session.Sum,
          cartData:usercart,
          Items:count,
          couponApplied:coupan?.discountPercentage,
          UserName:req.session.logged.name,
          Total:req.query.total
      })
      newOrder.save()
      req.session.copponAplied=null
      res.send({success:true})
    }   
    } 
    if(req.query.pm==='wallet'){
      
          const user=await usercollection.findOne({_id:req.session.logged._id})
         
      if( user.walletBalance<req.query.total){
        res.send({checkBalance:true})
        
      }else{
          const usercart=await cartCollection.find({userId:req.query.id})
      await cartCollection.deleteMany({userId:req.query.id})
      
      var count=0
      for(let i=0;i<usercart?.length;i++){
       var cartData=usercart[i]?._id
          count++
      }
     
    
  
      for (let i = 0; i < usercart?.length; i++) {
        await productCollection.updateOne(
          { _id: usercart[i].productId },
          { $inc: { productStock: -usercart[i].productQuantity } }
        );
      }   
      
      
      const orderId = Math.floor(100000 + Math.random() * 900000);
    const newOrder = new orderCollection({
      OrderId:orderId,
      userId:req.query.id,
      paymentType:'Wallet',
      UserName:req.session.logged.name,
      address:req.query.addressId,
      grandTotalCost:req.session.Sum,
      cartData:usercart,
      Items:count,
      UserName:req.session.logged.name,
      couponApplied:req.session?.copponAplied,
      Total:req.query.total
    
  })
  newOrder.save()
  
  const total=Number(req.query.total)
  const wallet3= new walletCollection({
    userId:req.query.id,
    PaymentType:'wallet',
    walletBalance :req.query.total,
    transactionsDate:new Date(),
    transactiontype:'Debited'
 })
 wallet3.save()
  const wallet2=await usercollection.updateOne({_id:req.query.id},{$inc:{walletBalance:-total}})
  req.session.copponAplied=null
  
  res.send({success:true})
      
 
      }
}
         
      }
      catch(error){
        next(new AppError('Somthing went Wrong', 500));
      }
     }
     const checkOut5=async(req,res,next)=>{
      try{
      
       
        
          const user = await usercollection.findById(req.session.logged._id);
          
          
        if (user.failPayments.includes(req.query.orderId)) {
          c
        const user2=  await orderCollection.updateOne(
            { OrderId: req.query.orderId },
            {
              $set: {
                paymentType: "Online Payment",orderStatus:'Pending'
              },
            }
          );
      
        let indx = user.failPayments.indexOf(req.query.orderId);
        
        user.failPayments.splice(indx, 1);
        await user.save();
        await cartCollection.deleteMany({userId:req.session.logged._id})
        req.session.paymentId=null
         res.render('userpages/checkout4',{userLogged:req.session.logged})
        }else{
         if(req.session.paymentId){
        var usercart=await cartCollection.find({userId:req.session.logged._id})
        const add =await addressCollection.findOne({userId:req.session.logged._id})          
        var count=0
        for(let i=0;i<usercart?.length;i++){
         var cartData=usercart[i]?._id
            count++
        }         
                  
                
        for (let i = 0; i < usercart?.length; i++) {
          await productCollection.updateOne(
            { _id: usercart[i].productId },
            { $inc: { productStock: -usercart[i].productQuantity } }
          );
        }
        
        
         
      
     
       
         
       
       
        const orderId = Math.floor(100000 + Math.random() * 900000);
        const newOrder = new orderCollection({
          OrderId:  req.session.orderId,
          userId:req.session.logged._id,
          UserName:req.session.logged.name,
          paymentType:'Online Payment',
          paymentId:req.session.paymentId,
          address:add._id,
          grandTotalCost:req.session.Sum,
          cartData:usercart,
          Items:count,
          couponApplied:req.session.copponAplied,
          UserName:req.session.logged.name,
          Total:req.session.total
      })
      newOrder.save()
      req.session.paymentId=null
      req.session.copponAplied=null
      await cartCollection.deleteMany({userId:req.session.logged._id})
      res.render('userpages/checkout4',{userLogged:req.session.logged})
    }
  
    else{
      
         res.render('userpages/checkout4',{userLogged:req.session.logged})
      
      }
    
    }
      }
      catch(error){
        next(new AppError('Somthing went Wrong', 500));
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
    const Chek3page=async(req,res,next)=>{
      try{
        
        const useraddress= await addressCollection.findOne({userId:req.query.id})
        
      
        const usercart=await cartCollection.find({userId:req.query.id})
        const grandTotal=Number(req.session.grandTotal)
        
        
        req.session.grandtotal=grandTotal
        
        const total=(req.session.grandtotal)
       
        res.render('userpages/checkout3',{userLogged:req.session.logged,userDet:useraddress,usercartDet:usercart,grandTotal:req.session.grandTotal,Total:total,pm:req.query.payment})
         
      }
      catch(error){
        next(new AppError('Somthing went Wrong', 500));
      }
     }
  const applyCoupon=async(req,res,next)=>{
    try{
      const coupon=await couPonCollection.findOne({couponCode:req.query.couponCode})
      
      if(coupon.minimumPurchase<=req.session.Sum){
       
           const Total=req.session.Sum-coupon.discountPercentage
           req.session.grandTotal=Total
           req.session.copponAplied=coupon.discountPercentage
        
           res.send({success:true,grandTotal:Total,Discount:coupon.discountPercentage})
      }else{
        res.send({success:false})
      }

    }catch(error){
      next(new AppError('Somthing went Wrong', 500));
    }
  }  

  const removeCoupan=async(req,res,next)=>{
    try{
      req.session.copponAplied=0
      const Total=req.session.Sum
           req.session.grandTotal=Total
          
        
           res.send({success:true,grandTotal:Total})
    }
    catch(error){
      next(new AppError('Somthing went Wrong', 500));
    }
  }

module.exports={Cart, addTocart,cartbutton,checkOut1,checkOut2,checkOut3,checkOut4,checkOut5,removeCart,Chek3page,applyCoupon,removeCoupan}