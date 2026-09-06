const User=require("../models/User");
const mailSender=require("../utils/mailSender");
const bcrypt=require("bcrypt");
const crypto=require("crypto");
const { getRedisClient, setWithExpiry } = require("../config/redis");

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
        const redis = await getRedisClient();
        // Keep the reset token outside the user document so Redis can expire it automatically.
        await setWithExpiry(redis, `password-reset:${token}`, user._id.toString(), 300);
        await User.findOneAndUpdate({email:email},{resetPasswordExpires:Date.now()+5*60*1000},{returnDocument:"after"});
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
        const url=`${frontendUrl}/update-password/${token}`; //reset password url

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

        const redis = await getRedisClient();
        const userId = await redis.get(`password-reset:${token}`);

        if(!userId){
            return res.status(400).json({success:false,message:"Invalid token"});
        }

        //hash password
        const hashedPassword=await bcrypt.hash(password,10);

        //update password
        await User.findByIdAndUpdate(userId,{password:hashedPassword},{returnDocument:"after"});
        await redis.del(`password-reset:${token}`);
        //send response
        return res.status(200).json({success:true,message:"Password reset successfully"});
    }
    catch(err){
        console.log(err);
        return res.status(500).json({success:false,message:"Something went wrong while resetting password"});
    }
}
