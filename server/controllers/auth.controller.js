import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import AppError from '../utils/appError.js';
// jwt token
const registerToken = (_id) =>{
    return jwt.sign({_id}, process.env.JWT_SECRET, {expiresIn:"7d"})
}

// register user

export const register = async(req, res) => {
 try {
    const {name, email, password} = req.body;
    if(!name || !email || !password) {
        throw new AppError("Please fill all the fields", 400)
    }
   const existingUser = await User.findOne({email})
   if(existingUser){
    throw new AppError("User already exists", 400)
   }
//    password hashing
const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({name, email, password: hashedPassword})
    const token = registerToken(user._id)
    res.status(201).json({success:true, token})
 } catch (error) {
    next(error)
 }
}


export const login = async(req, res, next) => {
    try {
        const {email, password} = req.body;
        if(!email || !password) {
            throw new AppError("Please fill all the fields", 400)
        }
        const user = await User.findOne({email}).select('+password');
        if(!user) {
            throw new AppError("Invalid email or password", 401)
        }

        // password hashing and comparing
        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch) {
            throw new AppError("Invalid email or password", 401)
        }
        const token = registerToken(user._id);
        res.status(200).json({success:true, token});
    } catch (error) {
        next(error);
    }
}

// logout user
export const logout = async(req, res) => {
    res.status(200).json({success:true, message:"Logged out successfully"})
}
