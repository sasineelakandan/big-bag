const mongoose= require('mongoose')

const walletSchema= new mongoose.Schema({
    userId: { type: mongoose.Types.ObjectId, required: true, ref:'users'},
    walletBalance: { type: Number, default: 0 },
    transactionsDate:{type: Date, default: Date.now },
  
})

module.exports =mongoose.model('wallets', walletSchema)
