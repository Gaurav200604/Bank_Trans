const {Router} = require('express');
const transactionRoutes = Router();
const transactionController = require('../controllers/transaction.controller');
const authMiddleware = require('../middleware/auth.middleware');

// post /api/transactions
// create a new transaction

transactionRoutes.post('/', authMiddleware.authMiddleware,transactionController.createTransaction);


transactionRoutes.post('/system/initial-funds' , authMiddleware.authSystemUserMiddleware,transactionController.createInitialFundsTransaction);   

module.exports = transactionRoutes;
