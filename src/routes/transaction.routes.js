const {Router} = require('express');
const transactionRoutes = Router();

const authMiddleware = require('../middleware/auth.middleware');


transactionRoutes.get('/', authMiddleware.authMiddleware, (req, res) => {
    res.send('Transaction route is working');
}
);

module.exports = transactionRoutes;
