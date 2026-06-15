const express = require("express");
const { authMiddleware } = require("../middleware/auth.middleware");
const accountController = require("../controllers/account.controller"); 

const router = express.Router();


// post / api/account/
// crate new account for user

router.post("/", authMiddleware, accountController.createAccountController);

module.exports = router;
