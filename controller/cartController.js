const productCollection=require('../model/productmodel')
const categoryCollection=require('../model/categorymodel')
const addressCollection=require('../model/addressmodel')
const usercollection=require('../model/usermodel')
const cartCollection=require('../model/cartmodel')


const Cart=async(req,res)=>{
    try{
        
        const cart= await cartCollection.find().populate('productId')
        console.log(cart)
        res.render('userpages/cart',{userLogged:req.session.logged,cartDet:cart})
    }
    catch(error){
        console.log(error)
    }
}
const addTocart=async(req,res)=>{
    try{
        
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
    }
    catch(error){
        console.log(error)
    }
}

module.exports={Cart, addTocart}