
const usercollection = require('../model/usermodel')
const categorycollection = require('../model/categorymodel')
const productCollection=require('../model/productmodel')


const loginpage = async (req, res) => {
    try {
        if (req.session.admin) {
            res.render('adminpages/adminhome')
        } else {
            res.render('adminpages/adminlogin')
        }

    } catch (err) {
        console.log(err);
    }

}

const adminlogin = async (req, res) => {
    try {
        if (req.body.email == process.env.ADMINEMAIL && req.body.password == process.env.ADMIN_PASS) {
            req.session.admin = true
            res.send({ success: true })
        } else {
            res.send({ invalidPass: true })
        }
    } catch (err) {
        console.log(err);
    }

}
const adminlogout = async (req, res) => {
    try {
        req.session.admin = false
        res.redirect('/admin')
    } catch (err) {
        console.log(err);
    }

}

const usermanagement = async (req, res) => {
    try {
        let userdetail;
        if (req.session.search) {
            userdetail = req.session.search
            req.session.search = null
            req.session.save()
        } else {
            userdetail = await usercollection.find()
        }
        res.render('adminpages/usermanagement', { userdet: userdetail })
    } catch (err) {
        console.log(err);
    }
}


const userblock = async (req, res) => {
    try {
        let userblock
        if (req.query.action == 'unblock') {
            userblock = false
        } else {
            userblock = true
        }
        await usercollection.updateOne({ _id: req.query.id }, { $set: { isBlocked: userblock } })
        res.send({ userstat: userblock })
    } catch (err) {
        console.log(err);
    }
}
const usersearch = async (req, res) => {
    

    try {
        const searchuser = await usercollection.find({ name: { $regex: req.body.search, $options: 'i' } })
        req.session.search = searchuser
        res.redirect('/usermanagement')
    } catch (error) {
        console.log(error)
    }

}





module.exports = { adminlogin, loginpage, adminlogout, usermanagement, userblock, usersearch,

}