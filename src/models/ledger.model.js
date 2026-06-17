const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema({
    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account", 
        required: [true, "Account is required"],
        index: true,
        immutable: true
    },
    amount:{
        type: Number,
        required: [true, "Amount is required"],
        immutable: true
    },
    transaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction",
        required: [true, "Transaction is required"],
        index: true,
        immutable: true 
    },
    type: {
        type: String,
        enum: { 
            values: ['debit', 'credit'],
            message: 'Type must be either debit or credit'
        },
        required: [true, "Type is required"],
        immutable: true
    }
})

function preventledfermodification(){
    throw new Error("Ledger entries cannot be modified or deleted");
}

ledgerSchema.pre('updateOne', preventledfermodification);
ledgerSchema.pre('deleteOne', preventledfermodification);   
ledgerSchema.pre('findOneAndUpdate', preventledfermodification);
ledgerSchema.pre('findOneAndDelete', preventledfermodification);
ledgerSchema.pre('remove', preventledfermodification);
ledgerSchema.pre('deleteMany', preventledfermodification);
ledgerSchema.pre('updateMany', preventledfermodification);
ledgerSchema.pre('findOneAndRemove', preventledfermodification);
ledgerSchema.pre('findOneAndReplace', preventledfermodification);

const LedgerModel = mongoose.model('Ledger', ledgerSchema);

module.exports = LedgerModel;
