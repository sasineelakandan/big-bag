const orderCollection = require('../model/ordermodel')
const userCollection = require('../model/usermodel')
const addressCollection = require('../model/addressmodel')
const productCollection = require('../model/productmodel')
const walletCollection=require('../model/Walletmodel')
const AppError=require('../middlewere/errorhandling')
const allOrder = async (req, res,next) => {
    try {
        let orderDetails = await orderCollection.find({ userId: req.query.id }).sort({_id:-1})
       
        res.render('userpages/allorders', { userLogged: req.session.logged, orderDet: orderDetails})
    }
    catch (error) {
        next(new AppError(error, 500));
    }
}
const singleOrder = async (req, res,next) => {
    try {

        const orderDetails = await orderCollection.findOne({ _id: req.query.id })

        const userDetails = await userCollection.findOne({ _id: req.query.user })
        const useradd = await addressCollection.findOne({ _id: req.query.add })
        res.render('userpages/singleOrders', { userLogged: req.session.logged, orderDet: orderDetails, userDet: userDetails, userAdd: useradd })
    }
    catch (error) {
        next(new AppError(error, 500));
    }
}
const Cancel = async (req, res,next) => {
    try {
    

        const orderId = req.query.order;
        const cartProductId = req.query.id;
     
        
        const order = await orderCollection.findOne(
            { _id: orderId }
             
          );

  const a=order.cartData
  for(let i=0;i<a.length;i++){
    if(a[i]._id==cartProductId){
      if(a[i].Status!=='cancel'){
        a[i].Status='cancel'
        let b = a[i].productId
            let qty = a[i].productQuantity
            let price=a[i].totalCostPerProduct
            if (order.paymentType == 'Wallet' || order.paymentType == 'Online Payment') {
                console.log('online')
                
                
                const walletUpdateResult = await userCollection.updateOne(
                    { _id: order.userId },
                    { $inc: { walletBalance: +a[i].totalCostPerProduct } }
                );
                console.log(walletUpdateResult);
                
                
                const walletTransaction =new walletCollection({
                    userId: order.userId,
                    walletBalance: a[i].totalCostPerProduct,
                    PaymentType: order.paymentType,
                    transactionsDate: new Date(),
                    transactiontype: 'credited'
                });
                
                const saveResult = await walletTransaction.save();
                console.log('Transaction saved:', saveResult);
            }
            const update1 = await productCollection.updateOne({ _id: b }, { $inc: { productStock: +qty } })

      }  
            
        }
    
       
    }  await orderCollection.updateOne({ _id: req.query.order }, { $set: { cartData:a } })
    let flag=1
    for(i=0;i<a.length;i++){
        if(a[i].Status!='cancel'){
          flag=0
        }
    }if(flag==1){
        await orderCollection.updateOne({ _id:orderId }, { $set: { orderStatus: 'cancel' } })  
    }
   
     res.send({success:true})



        



       
  }
    
    catch (error) {
        next(new AppError(error, 500));
    }
}
const Cancelall = async (req, res,next) => {
    try {
        const orderDet = await orderCollection.findOne({ _id: req.query.order })
        let a = orderDet.cartData
        for (i = 0; i < a.length; i++) {
            a[i].Status='cancel'
            let b = a[i].productId
            let qty = a[i].productQuantity
            const update1 = await productCollection.updateOne({ _id: b }, { $inc: { productStock: +qty } })
        }
        await orderCollection.updateOne(
            { _id: req.query.order }, 
            { $set: { orderStatus: 'cancel', cartData: a } }
        );
        
        res.send({ success: true })
    }
    catch (error) {
        next(new AppError(error, 500));
    }
}
const adminOrder=async(req,res,next)=>{
    try{
        var orderDetails=await orderCollection.find({}).sort({_id:-1})
      
          
      const productsPerPage = 7
      const totalPages = orderDetails.length / productsPerPage
      const pageNo = req.query.pages || 1
      const start = (pageNo - 1) * productsPerPage
      const end = start + productsPerPage
      orderDetails = orderDetails.slice(start, end)
        
        
        res.render('adminpages/ordermanagement',{orderDet:orderDetails,totalPages:totalPages})
      }
      catch(error){
        next(new AppError(error, 500));
      }
  }

const orderStatus=async(req,res,next)=>{
   try{ 
    const orderDetails=await orderCollection.findOne({_id:req.query.orderId})
    

        const userDetails=await userCollection.findOne({_id:req.query.user})
        const useradd=await addressCollection.findOne({_id:req.query.add})
    res.render('adminpages/singleOrder',{orderDet:orderDetails,userDet:userDetails,userAdd:useradd})
}
catch(error){
    next(new AppError(error, 500));
}
}
const updateStatus=async(req,res,next)=>{
 try{
    console.log(req.query.id)
    const order=await orderCollection.findOne({_id:req.query.id})
    const a=order.cartData
   let b=req.query.value

  let c= b.split('')
   c.pop()
    
   let d=c.join('')
  
   
for(let i=0;i<a.length;i++){
    if(order.orderStatus=='cancel'){
            a[i].Status='cancel'
         }
    if(a[i]._id==req.query.cardid){
    
        if(d=='Shipped'){
            a[i].Status='shipped'
            
           
         }
         if(d=='cancel'){
            a[i].Status='cancel'
            
           
         } 
         if(d=='Pending'){
            a[i].Status='Pending'
            
           
         } 
         if(d=='Delivered'){
            a[i].Status='Delivered'
            
           
         } 
         if(d=='Return'){
            a[i].Status='Return'
            
           
         }    
        }
    }
        
    await orderCollection.updateOne({ _id: req.query.id }, { $set: { cartData:a } })
    res.send({success:true})
}       
catch(error){
    next(new AppError(error, 500));
}
}
const updateStatus2=async(req,res,next)=>{
    try{
      
       await orderCollection.updateOne({ _id: req.query.id }, { $set: { orderStatus:req.query.value} })
       const order=await orderCollection.findOne({_id:req.query.id})
        const a=order.cartData
       for(let i=0;i<a.length;i++){
        if(order.orderStatus=='cancel'){
                a[i].Status='cancel'
                
             }
            }
        
            await orderCollection.updateOne({ _id: req.query.id }, { $set: {cartData:a} })
      
       res.send({success:true})
   }       
   catch(error){
    next(new AppError(error, 500));
   }
   }

   const RetunOrder=async(req,res,next)=>{
    
  

    try {


        const orderId = req.query.order;
        const cartProductId = req.query.id;
     
        
        const order = await orderCollection.findOne(
            { _id: orderId }
             
          );

  const a=order.cartData
  for(let i=0;i<a.length;i++){
    if(a[i]._id==cartProductId){
      if(a[i].Status=='Delivered'){
        a[i].Status='Return'
        let b = a[i].productId
            let qty = a[i].productQuantity
            let price=a[i].totalCostPerProduct
            if (order.paymentType == 'Wallet' || order.paymentType == 'Online Payment') {
                
                
                
                const walletUpdateResult = await userCollection.updateOne(
                    { _id: order.userId },
                    { $inc: { walletBalance: +a[i].totalCostPerProduct } }
                );
                console.log(walletUpdateResult);
                
                
                const walletTransaction =new walletCollection({
                    userId: order.userId,
                    walletBalance: a[i].totalCostPerProduct,
                    PaymentType: order.paymentType,
                    transactionsDate: new Date(),
                    transactiontype: 'credited'
                });
                
                const saveResult = await walletTransaction.save();
                console.log('Transaction saved:', saveResult);
            
            }
            const update1 = await productCollection.updateOne({ _id: b }, { $inc: { productStock: +qty } })
           
      }  
            
        }
    
       
    }  await orderCollection.updateOne({ _id: req.query.order }, { $set: { cartData:a } })
    let flag=1
    for(i=0;i<a.length;i++){
        if(a[i].Status!='Return'){
          flag=0
        }
    }if(flag==1){
        await orderCollection.updateOne({ _id:orderId }, { $set: { orderStatus: 'Return' } })  
    }
   res.send({success:true})
  



        



  }
    
    catch (error) {
        next(new AppError(error, 500));
    }

} 
   
    module.exports = { allOrder, singleOrder, Cancel, Cancelall ,adminOrder,orderStatus,updateStatus,updateStatus2,RetunOrder}