const orderCollection=require('../model/ordermodel')
const userCollection=require('../model/usermodel')  
const addressCollection=require('../model/addressmodel') 
const productCollection=require('../model/productmodel')
const allOrder=async(req,res)=>{
    try{
        const orderDetails=await orderCollection.find({userId:req.query.id})
        res.render('userpages/allorders',{userLogged:req.session.logged,orderDet:orderDetails})
        }
    catch(error){
        console.log(error)
    }
}
const singleOrder=async(req,res)=>{
    try{
        
        const orderDetails=await orderCollection.findOne({_id:req.query.id})
        
         const userDetails=await userCollection.findOne({_id:req.query.user})
         const useradd=await addressCollection.findOne({_id:req.query.add})
        res.render('userpages/singleOrders',{userLogged:req.session.logged,orderDet:orderDetails,userDet:userDetails,userAdd:useradd})
        }
    catch(error){
        console.log(error)
    }
}
const Cancel=async(req,res)=>{
    try{ 
     const orderDet= await orderCollection.findOne({_id:req.query.order})
     let a=orderDet.cartData
     let b
     for(let i=0;i<a.length;i++){
            if(req.query.id==a[i]._id){
                let b=a[i].productId
                let qty=a[i].productQuantity
                const update1=await productCollection.updateOne({_id:b},{$inc:{productStock:+qty}})
                  a.pull(a[i])
            }
           
     }
     orderDet.cartData=a
     
    const update = await orderCollection.updateOne({_id:req.query.order},{$set:{cartData:orderDet.cartData}})
    res.redirect('/singleorders')
    
    }
    catch(error){
        console.log(error)
    }
}
const Cancelall=async(req,res)=>{
    try{
        const orderDet= await orderCollection.findOne({_id:req.query.order})
        let a=orderDet.cartData
        for(i=0;i<a.length;i++){
            let b=a[i].productId
                let qty=a[i].productQuantity
                const update1=await productCollection.updateOne({_id:b},{$inc:{productStock:+qty}})
        }
        await orderCollection.deleteOne({_id:req.query.order})
        res.send({success:true})
    }
    catch(error){
        console.log(error)
    }
}
module.exports={allOrder,singleOrder,Cancel,Cancelall}