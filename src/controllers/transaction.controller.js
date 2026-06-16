const transactionModel = require('../models/transaction.model');
const ledgerModel = require('../models/ledger.model');
const accountModel = require('../models/account.model');
const emailService = require('../services/email.service');
const mongoose = require('mongoose');
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

    const fromUserAccount = await accountModel.getAccountById({
        _id: fromAccount,
})

    const toUserAccount = await accountModel.getAccountById({
        _id: toAccount,
    })

if(!fromUserAccount || !toUserAccount){
    return res.status(404).json({message: "Account not found"});    
}



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
