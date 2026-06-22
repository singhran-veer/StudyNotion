const User=require("../models/User");
const OTP=require("../models/OTP");
const otpGenerator=require("otp-generator");
const bcrypt=require("bcrypt");
const Profile = require("../models/Profile");
const nodemailer=require("nodemailer");
const mailSender=require("../utils/mailSender");
const {passwordUpdated}=require("../mail/templates/passwordUpdate");
const jwt=require("jsonwebtoken");
require("dotenv").config();
//sendOTP
exports.sendOTP=async(req,res)=>{
    try{
        //fetch email from req.body
        const {email}=req.body;

        //check if user already exists
        const checkUserPresent=await User.findOne({email});

        if(checkUserPresent){
            return res.status(401).json({success:false,message:"User already exists"});
        }

        //generate otp
        var otp=otpGenerator.generate(6,{digits:true,lowerCaseAlphabets:false,upperCaseAlphabets:false,specialChars:false});
        console.log("OTP generated:",otp);

        //check uniqueness of otp
        let result=await OTP.findOne({otp:otp});

        while(result){
            otp=otpGenerator.generate(6,{digits:true,lowerCaseAlphabets:false,upperCaseAlphabets:false,specialChars:false});
            console.log("New OTP generated:",otp);
            result=await OTP.findOne({otp:otp});
        }

        const otpPayload={email,otp};
        //create an entry for otp
        const otpBody= await OTP.create(otpPayload);
        console.log("OTP created:",otpBody);

        res.status(200).json({
            success:true,
            message:"OTP sent successfully",
            otp
        })
    }
    catch(err){
        console.log(err);
        return res.status(500).json({success:false,message:"Internal server error"});
    } 
}


//signup
exports.signUp=async(req,res)=>{
    try{
        //data fetch from request body
        const {firstName,lastName,email,password,confirmPassword,accountType,contactNumber,otp}=req.body;
        
        //validate
        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp){
            return res.status(403).json({success:false,message:"All fields are required"});
        }

        if(password!==confirmPassword){
            return res.status(400).json({success:false,message:"Password and confirm password do not match"});
        }

        //check if user already exists
        const checkUserPresent=await User.findOne({email});
        if(checkUserPresent){
            return res.status(400).json({success:false,message:"User already exists"});
        }

        //find most recent otp from DB
        const recentOtp=await OTP.findOne({email}).sort({createdAt:-1});

        //validate otp
        if(!recentOtp){
            return res.status(400).json({success:false,message:"OTP not found"});
        }
        if(recentOtp.otp!==otp){
            return res.status(400).json({success:false,message:"Invalid OTP"});
        }

        //hash password        
        const hashedPassword=await bcrypt.hash(password,10);

        //create profile to add in additional details
        const profileDetails= await Profile.create({
            gender:null,
            dateOfBirth:null,
            about:null,
            contactNumber:null,
        });

        //create user
        const userPayload={firstName,lastName,email,password:hashedPassword,accountType,contactNumber,additionalDetails:profileDetails._id,image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`};
        const user=await User.create(userPayload);

        return res.status(200).json({
            success:true,
            message:"User registered successfully",
            user
        })
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:"Error in registering user"
        })
    }
}


//login
exports.login=async(req,res)=>{
    try{
        //data fetch from request body
        const {email,password}=req.body;

        //validate
        if(!email || !password){
            return res.status(403).json({success:false,message:"All fields are required"});
        }

        //check if user exists or not
        const user=await User.findOne({email}).populate("additionalDetails");
        if(!user){
            return res.status(401).json({
                success:false,
                message:"User does not exist, register first"
            });
        }

        //generate JWT, after password matching
        if(await bcrypt.compare(password,user.password)){
            const payload={
                email:user.email,
                id:user._id,
                accountType:user.accountType,                
            };
            const token=jwt.sign(payload,process.env.JWT_SECRET_KEY,{expiresIn:"2h"});
            user.token=token;
            user.password=undefined;

            //create cookie and send response
            const options={
                expires:new Date(Date.now()+3*24*60*60*1000),
                httpOnly:true
            }
            res.cookie("token",token,options).status(200).json({
                success:true,
                message:"User logged in successfully",
                user,
                token
            });
        }
        else{
            return res.status(401).json({
                success:false,
                message:"Incorrect password"
            });
        }

        
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:"Error in logging in user"
        })
    }
}


// Controller for Changing Password
exports.changePassword = async (req, res) => {
	try {
		// Get user data from req.user
		const userDetails = await User.findById(req.user.id);

		// Get old password, new password, and confirm new password from req.body
		const { oldPassword, newPassword } = req.body;

		// Validate old password
		const isPasswordMatch = await bcrypt.compare(
			oldPassword,
			userDetails.password
		);
		if (!isPasswordMatch) {
			// If old password does not match, return a 401 (Unauthorized) error
			return res
				.status(401)
				.json({ success: false, message: "The password is incorrect" });
		}

		// Match new password and confirm new password
		// if (newPassword !== confirmNewPassword) {
		// 	// If new password and confirm new password do not match, return a 400 (Bad Request) error
		// 	return res.status(400).json({
		// 		success: false,
		// 		message: "The password and confirm password does not match",
		// 	});
		// }

		// Update password
		const encryptedPassword = await bcrypt.hash(newPassword, 10);
		const updatedUserDetails = await User.findByIdAndUpdate(
			req.user.id,
			{ password: encryptedPassword },
			{ returnDocument: "after" }
		);

		// Send notification email
		try {
			const emailResponse = await mailSender(
				updatedUserDetails.email,
				passwordUpdated(
					updatedUserDetails.email,
					`Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
				)
			);
			console.log("Email sent successfully:", emailResponse.response);
		} catch (error) {
			// If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
			console.error("Error occurred while sending email:", error);
			return res.status(500).json({
				success: false,
				message: "Error occurred while sending email",
				error: error.message,
			});
		}

		// Return success response
		return res
			.status(200)
			.json({ success: true, message: "Password updated successfully" });
	} catch (error) {
		// If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
		console.error("Error occurred while updating password:", error);
		return res.status(500).json({
			success: false,
			message: "Error occurred while updating password",
			error: error.message,
		});
	}
};
