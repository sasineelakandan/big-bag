const usercollection = require('../model/usermodel')
const otpcollections = require('../model/otpmodel')
const sendotp = require("../services/sendotp")
const bcrypt = require('bcryptjs')



const home = (req, res) => {

    res.render('home')
}
const otppage = (req, res) => {
    try {
        if (req.session.user) {
            res.redirect('/')
        } else {
            res.render('otppage')
        }

    } catch (err) {
        console.log(err);
    }
}



const loginget = async (req, res) => {

    if (req.session.user) {
        
        
        res.redirect('/')
    } else {
        res.render('login')
    }
}

const signupget = (req, res) => {
    res.render('signup')
}
const verifyotp = async (req, res) => {




    try {
        const usersOTP = await otpcollections.findOne({ userId: req.session.logged._id });


        const otpmatch = await bcrypt.compare(req.body.otp, usersOTP.otp)

        const notExpired = usersOTP.expiryDate.toISOString() > new Date().toISOString()


        if (otpmatch && notExpired) {

            await usercollection.updateOne({ _id: req.session.logged._id }, { $set: { isVerified: true } })
            req.session.user= true

            res.status(200).send({ otpverified: true })
        } else {
            res.status(200).send({ otpinvalid: true })
        }


    } catch (error) {
        console.log(error);
    }
}

const register = async (req, res) => {
    try {

        const checksignin = await usercollection.findOne({ $or: [{ email: req.body.email }, { phone: req.body.phone }] })

        if (checksignin) {
            res.status(208).send({ userExists: true })
        } else {
            res.status(200).send({ userExists: false })
        }

    } catch (err) {
        console.log(err);
    }
}


const userRegister = async (req, res) => {





    try {
        const bcryptpassword = await bcrypt.hash(req.body.password, 10)
        const user = new usercollection({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            password: bcryptpassword,
        })
        await user.save()


        if (req.query.otp) {
            req.session.logged = await usercollection.findOne({ email: req.body.email })

            const genratedotp = Math.floor(100000 + Math.random() * 900000).toString()
            await sendotp(req.session.logged, genratedotp)
            const bcryptotp = bcrypt.hashSync(genratedotp, 10)
            const userotp = new otpcollections({
                userId: req.session.logged._id,
                otp: bcryptotp,
                generatedDate: new Date().toISOString(),
                expiryDate: new Date(Date.now() + 60000).toISOString()
            })
            await userotp.save()


        }
        res.status(200).send({ userSaved: true })
    }
    catch (error) {
        console.log(`THIS IS THE ERROR IN SIGN UP : ${error}`);
    }
}

const logionverify = async (req, res) => {

    try {
        const user = await usercollection.findOne({ email: req.body.email })
        if(user.isBlocked){
            req.session.logged=false
            res.send({blocked:true})
        }
        if (user) {
            const passwordMatch = await bcrypt.compare(req.body.password, user.password)
            if (passwordMatch) {
                req.session.logged = user
                res.send({ login: true })
            } else {
                res.send({ invalid: true })
            }
        } else {
            res.send({ invalid: true })
        }
    } catch (err) {
        console.log(err);
    }
}

    


const resendotp = async (req, res) => {
    try {

        const generatedotp = Math.floor(100000 + Math.random() * 900000).toString()
        await sendotp(req.session.logged, generatedotp)
        const bycryptotp = bcrypt.hashSync(generatedotp, 10)
        await otpcollections.updateOne({ userId: req.session.logged._id }, { $set: { otp: bycryptotp, generatedDate: new Date().toISOString(), expiryDate: new Date(Date.now() + 60000).toISOString() } })

        res.status(200).send({ otpsend: true })
    } catch (err) {
        console.log(err);
    }
}
const shoppage=async(req,res)=>{
    try{
        res.sender('shoppage')
    }
    catch(err){
        console.log(err)
    }
}




module.exports = { home, signupget, loginget, userRegister, logionverify, verifyotp, resendotp, otppage, register ,shoppage}