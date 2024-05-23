const mongoose= require('mongoose')

const walletSchema= new mongoose.Schema({
    userId: { type: mongoose.Types.ObjectId, required: true, ref:'users'},
    walletBalance: { type: Number, default: 0 },
    PaymentType:{type:String,required:true},
    transactionsDate:{type: Date, default: Date.now },
    transactiontype:{type:String,required:true}
})

module.exports =mongoose.model('wallets', walletSchema)
