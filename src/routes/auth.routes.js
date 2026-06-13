const express= require('express');
const authcontroller = require('../controllers/auth.controller');
const router = express.Router();

// post /api/auth/register
router.post('/register',authcontroller.userRegister);

// login route  post /api/auth/login
router.post('/login',authcontroller.userLogin);
module.exports = router;
