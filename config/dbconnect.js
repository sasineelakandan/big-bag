
const mongoose=require('mongoose')
module.exports=mongoose.connect('mongodb+srv://devasasi:WxAGvVRGeMH8lV82@cluster0.elv16wi.mongodb.net/bigbag')
.then(()=>{
console.log('mongodb atlas connected')
})
.catch((error)=>{
 console.log(error)
})
