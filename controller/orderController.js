const orderCollection = require('../model/ordermodel')
const userCollection = require('../model/usermodel')
const addressCollection = require('../model/addressmodel')
const productCollection = require('../model/productmodel')
const { subscribe } = require('../routes/user route')
const allOrder = async (req, res) => {
    try {
        const orderDetails = await orderCollection.find({ userId: req.query.id })
        res.render('userpages/allorders', { userLogged: req.session.logged, orderDet: orderDetails })
    }
    catch (error) {
        console.log(error)
    }
}
const singleOrder = async (req, res) => {
    try {

        const orderDetails = await orderCollection.findOne({ _id: req.query.id })

        const userDetails = await userCollection.findOne({ _id: req.query.user })
        const useradd = await addressCollection.findOne({ _id: req.query.add })
        res.render('userpages/singleOrders', { userLogged: req.session.logged, orderDet: orderDetails, userDet: userDetails, userAdd: useradd })
    }
    catch (error) {
        console.log(error)
    }
}
const Cancel = async (req, res) => {
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
            let gst=price*0.18
            let tt=price+gst
            
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
        console.log(error)
    }
}
const Cancelall = async (req, res) => {
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
        console.log(error)
    }
}
const adminOrder=async(req,res)=>{
    try{
      const orderDetails=await orderCollection.find()
    
        
      
      
      res.render('adminpages/ordermanagement',{orderDet:orderDetails})
    }
    catch(error){
        console.log(error)
    }
}
const orderStatus=async(req,res)=>{
    
    const orderDetails=await orderCollection.findOne({_id:req.query.orderId})
    

        const userDetails=await userCollection.findOne({_id:req.query.user})
        const useradd=await addressCollection.findOne({_id:req.query.add})
    res.render('adminpages/singleOrder',{orderDet:orderDetails,userDet:userDetails,userAdd:useradd})
}
const updateStatus=async(req,res)=>{
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
    console.log(error)
}
}
const updateStatus2=async(req,res)=>{
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
       console.log(error)
   }
   }

   const RetunOrder=async(req,res)=>{
    
  

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
            let gst=price*0.18
            let tt=price+gst
            
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
        console.log(error)
    }

} 
   
    module.exports = { allOrder, singleOrder, Cancel, Cancelall ,adminOrder,orderStatus,updateStatus,updateStatus2,RetunOrder}