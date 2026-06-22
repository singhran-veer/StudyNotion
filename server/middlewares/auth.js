const jwt=require("jsonwebtoken");
require("dotenv").config();
const User=require("../models/User");

//auth
exports.auth=async(req,res,next)=>{
    try{
        //extract token
        const token=req.cookies?.token || req.body?.token || req.header("Authorization")?.replace("Bearer ","");

        if(!token) return res.status(401).json({success:false,message:"Token is missing"}); //if token not found, return error

        //verify token
        try{
            const decoded=jwt.verify(token,process.env.JWT_SECRET_KEY);
            console.log(decoded);
            req.user=decoded;
        }
        catch(err){
            return res.status(401).json({success:false,message:"Invalid token"});
        }
        next();
        
    }
    catch(err){
        return res.status(500).json({success:false,message:"Something went wrong while validating token"});
    }
}

//isStudent
exports.isStudent=async(req,res,next)=>{
    try{
        
        if(req.user.accountType!=="Student") return res.status(401).json({success:false,message:"You are not a student"}); //if user is not a student, return error
        next();
    }
    catch(err){
        return res.status(500).json({success:false,message:"Something went wrong while validating user role"});
    }
}

//isInstructor
exports.isInstructor=async(req,res,next)=>{
    try{
        
        if(req.user.accountType!=="Instructor") return res.status(401).json({success:false,message:"You are not an instructor"}); //if user is not an instructor, return error
        next();
    }
    catch(err){
        return res.status(500).json({success:false,message:"Something went wrong while validating user role"});
    }
}

//isAdmin
exports.isAdmin=async(req,res,next)=>{
    try{
        
        if(req.user.accountType!=="Admin") return res.status(401).json({success:false,message:"You are not an admin"}); //if user is not an admin, return error
        next();
    }
    catch(err){
        return res.status(500).json({success:false,message:"Something went wrong while validating user role"});
    }
}
