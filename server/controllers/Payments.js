const {instance} = require('../config/razorpay');
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const {courseEnrollmentEmail} = require("../mail/templates/courseEnrollmentEmail");
const { default: mongoose, Mongoose } = require("mongoose");
const { paymentSuccessEmail } = require("../mail/templates/paymentSuccessfulEmail");
const crypto = require("crypto");
const CourseProgress = require("../models/CourseProgress")

exports.capturePayment = async (req, res) => {
    const {courses} = req.body;
    const userId =  req.user.id;

    if(!courses){
        return res.json({
            success:false,
            message:"Provide courseId"
        })
    }

    if (courses.length === 0) {
        return res.json({
            success:false,
            message:"Provide courseId"
        })
    }

    let totalAmount = 0;

    for (const courseId of courses){
        let course;
        try {
            
            course = await Course.findById(courseId);
            if(!course){
                return res.status(200).json({
                    success:false,
                    message:"Course doesn't exist"
                })
            }

            const uid = new mongoose.Types.ObjectId(userId);
            if(course.studentsEnrolled.includes(uid)){
                return res.status(200).json({
                    success:false,
                    message:"User already enrolled in this course"
                })
            }

            totalAmount += parseInt(course.price);
        } catch (error) {
            return res.status(500).json({
                success:false,
                message:error.message
            })
        }
    }
    
    console.log("The amount in capturePayment is", totalAmount)
    const currency = "INR"
    const options = {
        amount: totalAmount * 100,
        currency,
        receipt: Math.random(Date.now()).toString()
    }

    try {
        const paymentResponse = await instance.orders.create(options)
        res.json({
            success:true,
            message: paymentResponse
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false, message:"Could not Initiate Order"});
    }
}

exports.verifyPayment = async (req,res) => {
    console.log("request in verifyPayment is", req)
    const razorpay_order_id = req.body?.razorpay_order_id;
    const razorpay_payment_id = req.body?.razorpay_payment_id;
    const razorpay_signature = req.body?.razorpay_signature;
    const courses = req.body?.courses;
    const userId = req.user.id;

    if(!razorpay_order_id ||
        !razorpay_payment_id ||
        !razorpay_signature || !courses || !userId) {
            return res.status(200).json({success:false, message:"Payment Failed"});
    }

    let body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET)
                                    .update(body.toString())
                                    .digest("hex")

    if (expectedSignature === razorpay_signature) {
        
        await enrollStudents(courses, userId, res);

        return res.status(200).json({success:true, message:"Payment Verified"});
    }
    return res.status(200).json({success:false, message:"Payment Failed"});
}

const enrollStudents = async (courses, userId, res) => {
    if (!courses || !userId) {
        return res.status(400).json({success:false,message:"Please Provide data for Courses or UserId"});
    }

    for(const courseId of courses) {
        try {
            const updatedCourse = await Course.findByIdAndUpdate(courseId,
                {
                    $push: {
                        studentsEnrolled: userId
                    }
                }, {returnDocument:"after"})  

            if (!updatedCourse) {
                return res.status(500).json({success:false,message:"Course not Found"});
            }

            const courseProgress = await CourseProgress.create({
                courseID:courseId,
                userId:userId,
                completedVideos: [],
            })

            const updatedStudent = await User.findByIdAndUpdate(userId, {
                $push: {
                    courses: courseId,
                    courseProgress: courseProgress._id,
                }
            }, {returnDocument: "after"})

            const emailResponse = await mailSender(
                updatedStudent.email,
                `Successfully Enrolled into ${updatedCourse.courseName}`,
                courseEnrollmentEmail(updatedCourse.courseName, `${updatedStudent.firstName}`)
            )
        } catch (error) {
            console.log(error);
            return res.status(500).json({success:false, message:error.message});
        }
    }
}

exports.sendPaymentSuccessEmail = async (req,res) => {
    const {orderId, paymentId, amount} = req.body;

    const userId = req.user.id;

    if(!orderId || !paymentId || !amount || !userId) {
        return res.status(400).json({success:false, message:"Please provide all the fields"});
    }

    try {
        const user = await User.findById(userId);
        await mailSender(
            user.email,
            `Payment Received`,
            paymentSuccessEmail(`${user.firstName}`,
             amount/100,orderId, paymentId)
        )
    } catch (error) {
        console.log("error in sending mail", error)
        return res.status(500).json({success:false, message:"Could not send email"})
    }
}










// const {instance}=require("../config/razorpay");
// const Course=require("../models/Course");
// const User=require("../models/User");
// const mailSender=require("../utils/mailSender");
// const {courseEnrollmentEmail}=require("../mail/templates/courseEnrollmentEmail");
// const { default: mongoose } = require("mongoose");
// const crypto=require("crypto");

// //capture the payment and initiate the Razorpay order
// exports.capturePayment=async(req,res)=>{
//     try{
//         //get course and user id
//         const {course_id}=req.body;
//         const userId=req.user.id;

//         //validation
//         if(!course_id || !userId) return res.status(400).json({success:false,message:"All fields are required"});
//         let course;
//         try{
//             course=await Course.findById(course_id);
//             if(!course) return res.status(404).json({success:false,message:"Course not found"});
//             return res.status(200).json({success:true,course});
//         }
//         catch(err){
//             return res.status(404).json({success:false,message:"Course not found"});
//         }

//         //check if user is already enrolled
//         const uid=new mongoose.Types.ObjectId(userId);
//         const isEnrolled=course.studentsEnrolled.includes(uid);
//         if(isEnrolled) return res.status(400).json({success:false,message:"User is already enrolled in this course"});

//         //create order
//         const amount=course.price*100;
//         const currency="INR";

//         const options={
//             amount:amount,
//             currency:currency,
//             receipt:Math.random(Date.now()).toString(),
//             notes:{
//                 courseId:course_id,
//                 userId:userId
//             }
//         };

//         try{
//             const paymentResponse=await instance.orders.create(options);
//             return res.status(200).json({
//                 success:true,
//                 courseName:course.courseName,
//                 courseDescription:course.courseDescription,
//                 thumbnail:course.thumbnail,
//                 orderId:paymentResponse.id,
//                 amount:paymentResponse.amount,
//                 currency:paymentResponse.currency
//             });
//         }
//         catch(err){
//             return res.status(500).json({success:false,message:"Something went wrong while creating order"});
//         }
//     }
//     catch(err){
//         return res.status(500).json({success:false,message:"Something went wrong while creating order"});
//     }
// }


// //verify signature of Razorpay and Server

// exports.verifySignature=async(req,res)=>{
//     try{
//         const webhookSecret="12345678";

//         const signature=req.headers["x-razorpay-signature"];

//         //hmac bnane k lie hashing algo aur secret key ki zarurat hoti h
//         const shasum=crypto.createHmac("sha256",webhookSecret);
//         shasum.update(JSON.stringify(req.body));
//         //shasum ko digest bnane k lie use hexadecimal bnate h
//         const digest=shasum.digest("hex");

//         if(signature===digest){
//             console.log("Payment verified successfully");

//             //enroll the student
//             const {courseId,userId}=req.body.payload.payment.entity.notes;
            
//             try{
//                 const enrolledCourse=await Course.findByIdAndUpdate({_id:courseId},
//                     {
//                         $push:{studentsEnrolled:userId}
//                     },
//                     {returnDocument:"after"}
//                 );

//                 if(!enrolledCourse) return res.status(404).json({success:false,message:"Course not found"});
//                 console.log("Course enrolled successfully",enrolledCourse);

//                 const enrolledStudent=await User.findOneAndUpdate({_id:userId},
//                     {
//                         $push:{enrolledCourses:courseId}
//                     }, {returnDocument:"after"}
//                 );
//                 if(!enrolledStudent) return res.status(404).json({success:false,message:"User not found"});
//                 console.log("User enrolled successfully",enrolledStudent);

//                 //confirmation mail
//                 const emailResponse=await mailSender(enrolledStudent.email,"Congrats",`You have successfully enrolled in the course ${enrolledCourse.courseName}`);

//                 console.log(emailResponse);

//                 return res.status(200).json({success:true,message:"Payment verified successfully"});
//             }
//             catch(err){
//                 return res.status(500).json({success:false,message:"Something went wrong while verifying payment"});
//             }
//         }
//         else{
//             return res.status(400).json({success:false, message:"Payment verification failed"});
//         }
//     }
//     catch(err){
//         return res.status(500).json({success:false,message:"Something went wrong while verifying payment"});
//     }
// }

