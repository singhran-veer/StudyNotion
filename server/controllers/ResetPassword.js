const User=require("../models/User");
const mailSender=require("../utils/mailSender");
const bcrypt=require("bcrypt");
const crypto=require("crypto");

//resetPasswordToken
exports.resetPasswordToken=async(req,res)=>{
    try{
        //get email from req.body
        const {email}=req.body;

        //check if user exists
        const user=await User.findOne({email:email});
        if(!user){
            return res.status(401).json({success:false,message:"User does not exist"});
        }

        //generate token
        const token=crypto.randomUUID();
        //update user by adding token and expiration time
        const updatedDetails=await User.findOneAndUpdate({email:email},{token:token,resetPasswordExpires:Date.now()+5*60*1000},{returnDocument:"after"});
        const url=`http://localhost:3000/update-password/${token}`; //reset password url

        //send mail containing url
        await mailSender(email,"Reset password link from StudyNotion",url);

        return res.status(200).json({success:true,message:"Reset password link sent to your email",url});
    }
    catch(err){
        console.log(err);
        return res.status(500).json({success:false,message:"Something went wrong while sending reset password link"});
    }
}


//resetPassword
exports.resetPassword=async(req,res)=>{
    try{
        //data fetch
        const {password,confirmPassword,token}=req.body;

        //validation
        if(password!==confirmPassword){
            return res.status(400).json({success:false,message:"Password and confirm password do not match"});
        }

        //get user details from using token from db
        const userDetails=await User.findOne({token:token});

        if(!userDetails){
            return res.status(400).json({success:false,message:"Invalid token"});
        }

        //token time check
        if(userDetails.resetPasswordExpires<new Date()){
            return res.status(400).json({success:false,message:"Token expired"});
        }
        //hash password
        const hashedPassword=await bcrypt.hash(password,10);

        //update password
        await User.findOneAndUpdate({token:token},{password:hashedPassword},{returnDocument:"after"});
        //send response
        return res.status(200).json({success:true,message:"Password reset successfully"});
    }
    catch(err){
        console.log(err);
        return res.status(500).json({success:false,message:"Something went wrong while resetting password"});
    }
}
