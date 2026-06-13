const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');

async function userRegister(req,res){
    const { email, name, password } = req.body;

    const isUserExist = await userModel.findOne({ email });

    if(isUserExist){
        return res.status(422).json({
            success:false,
            
            message:"User already exists"
        })
    }

    const user = await userModel.create({
        email,
        name,
        password
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.cookie('token',token)
    res.status(201).json({
        user:{
            id:user._id,
            email:user.email,
            name:user.name
        },
        token
    })
}

async function userLogin(req,res){
    const { email, password } = req.body;

    const user = await userModel.findOne({ email }).select('+password');

    if(!user){  
        return res.status(401).json({
            success:false,
            message:"Invalid email or password"
        })
    }  
    const isvalidPassword = await user.comparePassword(password);

    if(!isvalidPassword){
        return res.status(401).json({
            success:false,
            message:"Invalid email or password"
        })
    }   
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.cookie('token',token)
    res.status(200).json({
        user:{
            id:user._id,
            email:user.email,
            name:user.name
        },
        token
    })

}

module.exports = {
    userRegister,
    userLogin   
}