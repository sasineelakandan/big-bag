const orderCollection = require('../model/ordermodel')
const userCollection = require('../model/usermodel')
const addressCollection = require('../model/addressmodel')
const productCollection = require('../model/productmodel')
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
        console.log(orderId)
        console.log(cartProductId)
        
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
            console.log(tt)
            const update1 = await productCollection.updateOne({ _id: b }, { $inc: { productStock: +qty } })
            const update2 = await orderCollection.updateOne({ _id:  req.query.order }, { $inc: { Total:-tt,Gst:-gst,grandTotalCost:-price,} })
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
   
  



        



        const orderDetails=await orderCollection.findOne({_id:req.query.order})

        const userDetails=await userCollection.findOne({_id:req.query.user})
        const useradd=await addressCollection.findOne({_id:req.query.add})
        res.render('userpages/singleOrders',{userLogged:req.session.logged,orderDet:orderDetails,userDet:userDetails,userAdd:useradd})

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
            let b = a[i].productId
            let qty = a[i].productQuantity
            const update1 = await productCollection.updateOne({ _id: b }, { $inc: { productStock: +qty } })
        }
        await orderCollection.updateOne({ _id: req.query.order }, { $set: { orderStatus: 'cancel' } })
        res.send({ success: true })
    }
    catch (error) {
        console.log(error)
    }
}
const adminOrder=async(req,res)=>{
    try{
      const orderDetails=await orderCollection.find()
      res.render('adminpages')
    }
}
module.exports = { allOrder, singleOrder, Cancel, Cancelall }