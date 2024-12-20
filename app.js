const express=require('express')
require('./config/dbconnect')
require('dotenv').config()

require('./middlewere/googleAuth')
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

  
 
  
  
  app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const status = err.status || 'error';
    res.status(statusCode).render('userpages/error', { statusCode, status, message: err.message });
  })
  
app.get('*', function(req, res){
    res.status(404).render('userpages/404');
  });

app.listen(8080,()=>{
    console.log('portstarted')
})