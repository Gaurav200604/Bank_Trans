const transactionModel = require('../models/transaction.model');
const ledgerModel = require('../models/ledger.model');
const accountModel = require('../models/account.model');
const emailService = require('../services/email.service');
// create a new transactioni 
// there is 10 steps
//     1- validate request
//     2-validate idempotency key
//     3- check account statusbar
//     4- derive sender balance from ledger
//     5- create transaction pending
//     6- create debit ledger entry
//     7- create credit ledger entry
//     8- mark transaction completed
//     9- commit mongodb session
//     10- send email notification


// 1- validate request

async function createTransaction(req,res){
    const {fromAccount, toAccount, amount,idempotencyKey} = req.body;

    if(!fromAccount || !toAccount || !amount || !idempotencyKey){
        return res.status(400).json({message: "Missing required fields"}); 
    }

    if(amount <= 0){
        return res.status(400).json({message: "Amount must be greater than zero"});
    }

    const fromUserAccount = await accountModel.findById(fromAccount).populate('user');

    const toUserAccount = await accountModel.findById(toAccount).populate('user');

if(!fromUserAccount || !toUserAccount){
    return res.status(404).json({message: "Account not found"});    
}


// 2-validate idempotency key

const isTransactionExists = await transactionModel.findOne({
    idempotencyKey: idempotencyKey,
})

if(isTransactionExists){
   if(isTransactionExists.status === "completed"){
       return res.status(409).json({message: "Transaction with this idempotency key already exists and is completed"});
   } 
   if(isTransactionExists.status === "pending"){
       return res.status(409).json({message: "Transaction with this idempotency key already exists and is pending"});
   }

   if(isTransactionExists.status === "failed"){
       return res.status(409).json({message: "Transaction with this idempotency key already exists and is failed"});
   }
   if(isTransactionExists.status === "reversed"){
       return res.status(409).json({message: "Transaction with this idempotency key already exists and is reversed"});
   }

}

// 3- check account status

if(fromUserAccount.status !== "active" || toUserAccount.status !== "active"){
    return res.status(400).json({message: "Both accounts must be active to perform a transaction"});
}

// 4- derive sender balance from ledger

const balance = await fromUserAccount.getBalance();

if(balance < amount){
    return res.status(400).json({message: "Insufficient balance"});
}


// 5- create transaction pending

const session = await transactionModel.startSession();
session.startTransaction();
let transaction;

try {

transaction = new transactionModel({
    fromAccount: fromAccount,
    toAccount: toAccount,
    amount: amount,
    idempotencyKey: idempotencyKey,
    status: "pending",
});
await transaction.save({ session });

const debitLedgerEntry = new ledgerModel({
    account: fromAccount,
    transaction: transaction._id,
    amount: amount,
    type: "debit",
});
await debitLedgerEntry.save({ session });

const creditLedgerEntry = new ledgerModel({
    account: toAccount,
    transaction: transaction._id,
    amount: amount,
    type: "credit",
});
await creditLedgerEntry.save({ session });

transaction.status = "completed";
await transaction.save({ session });

await session.commitTransaction();
} catch (error) {
    await session.abortTransaction();
    throw error;
} finally {
session.endSession();
}


// 10- send email notification

try {
    await emailService.sendTransactionEmail(fromUserAccount.user.email, fromUserAccount.user.name, amount, toUserAccount.user.name);
} catch (error) {
    console.error('Transaction email failed:', error.message);
}
return res.status(201).json({message: "Transaction completed successfully", transactionId: transaction._id});   


}

async function createInitialFundsTransaction(req,res){
    const {toAccount, amount, idempotencyKey} = req.body;

    if(!toAccount || !amount || !idempotencyKey){
        return res.status(400).json({message: "Missing required fields"});
    }

    if(amount <= 0){
        return res.status(400).json({message: "Amount must be greater than zero"});
    }
    
    const toUserAccount = await accountModel.findById(toAccount);

   if(!toUserAccount){
       return res.status(404).json({message: "Account not found"});
   }

  const fromUserAccount  = await accountModel.findOne({
    systemAccount: true,
    user: req.user._id,
   })
  
    if(!fromUserAccount){   
        return res.status(404).json({message: "System account not found"});
    }   

    const session = await transactionModel.startSession();
    session.startTransaction();

    let transaction;

    try {
    transaction = new transactionModel({
        fromAccount: fromUserAccount._id,
        toAccount: toUserAccount._id,   
        amount: amount,
        idempotencyKey: idempotencyKey,
        status: "pending",
    });
    await transaction.save({ session });

    const debitLedgerEntry = new ledgerModel({
        account: fromUserAccount._id,
        transaction: transaction._id,
        amount: amount,
        type: "debit",
    });
    await debitLedgerEntry.save({ session });

    const creditLedgerEntry = new ledgerModel({
        account: toUserAccount._id,
        transaction: transaction._id,
        amount: amount,
        type: "credit",
    });
    await creditLedgerEntry.save({ session });

    transaction.status = "completed";
    await transaction.save({ session });
    await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
    session.endSession();
    }

    return res.status(201).json({message: "Initial funds transaction completed successfully", transactionId: transaction._id});
}

module.exports = {
    createTransaction,
    createInitialFundsTransaction
}
