const productCollection=require('../model/productmodel')
const categoryCollection=require('../model/categorymodel')
const addressCollection=require('../model/addressmodel')



const account=async(req,res)=>{
    try{
        if(req.session.logged){
        res.render('userpages/account',{userLogged:req.session.logged})
    }else{
        res.render('userpages/account',{userLogged:null})
    }
  }
    catch(error){
        console.log(error)
    }
}
const addaddress=async(req,res)=>{
try{
    if(req.session.logged){
        res.render('userpages/addaddress',{userLogged:req.session.logged})
        

        
    }else{
        res.render('userpages/addaddress',{userLogged:null})
    }
}
catch(error){
    console.log(error)
}
}
module.exports={account,addaddress}