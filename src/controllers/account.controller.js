const accountmodel = require("../models/account.model");


async function createAccountController(req,res){
    const user = req.user;

    const account = await accountmodel.create({
        user: user._id,
        balance: 0
    });
    res.status(201).json({
        success: true,
        message: "Account created successfully",
        account
    });
}

module.exports = {
    createAccountController
};