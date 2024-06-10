const nodemailer=require('nodemailer')

const transpoter=  nodemailer.createTransport({
    service:'gmail',
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth:{
        user:process.env.USER_EMAIL,
        pass:process.env.USER_PASS
    }
})


let sendotp = async (user,otp) => {
    try {
        
          transpoter.sendMail({
            from: process.env.USER_EMAIL,
            to: user.email,
            subject: 'Registration OTP for bigbag',
            text: `Here is your One Time Password for registration: ${otp}`
        },(err,info)=>{
            if(err){
                console.log("Eerror in sending the email"+err);
            }
            console.log("Email sent succeed"+info);
        })
    } catch (err) {
        console.log(err);
    }
}


module.exports=sendotp