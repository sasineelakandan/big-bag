const express=require('express')
require('./config/dbconnect')
require('dotenv').config()


const app=express()
app.use(express.static('public'));
const session=require('express-session')
app.set('view engine','ejs')
const userrouter=require('./routes/user route')
const adminerout=require('./routes/adminroute')
app.use(express.json());
app.use(express.urlencoded({ extended: true }))







app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
}))
app.use((req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();

})
app.use(adminerout)
app.use(userrouter)
    
app.listen(8001,()=>{
    console.log('portstarted')
})