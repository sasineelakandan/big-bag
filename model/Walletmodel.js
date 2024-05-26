const mongoose= require('mongoose')

const walletSchema= new mongoose.Schema({
    userId: { type: mongoose.Types.ObjectId, required: true, ref:'users'},
    walletBalance: { type: Number, default: 0 },
    PaymentType:{type:String,},
    transactionsDate:{type: Date, default: Date.now },
    transactiontype:{type:String}
})

module.exports =mongoose.model('wallets', walletSchema)
