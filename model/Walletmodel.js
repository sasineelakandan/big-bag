const mongoose= require('mongoose')

const walletSchema= new mongoose.Schema({
    userId: { type: mongoose.Types.ObjectId, required: true, ref:'users'},
    walletBalance: { type: Number, default: 0 },
    transactionsDate:{type: Date, default: Date.now },
    transactionId:{type:String,require:true},
    transactionsMethod:{type:String,require:true}
})

module.exports =mongoose.model('wallets', walletSchema)
