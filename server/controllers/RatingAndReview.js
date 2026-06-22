const RatingAndReview = require("../models/RatingAndReview");
const Course=require('../models/Course');
const mongoose = require("mongoose");

//createRating
exports.createRating=async(req,res)=>{
    try{
        //get user id
        const userId=req.user.id;
        //fetch data from req body
        const {courseId,rating,review}=req.body;
        //check if user is enrolled
       
        const courseDetails=await Course.findOne({_id:courseId,studentsEnrolled:{$elemMatch:{$eq:userId}}});

        if(!courseDetails) return res.status(400).json({success:false,message:"User is not enrolled in this course"});

        //no multipe reviews
        const alreadyReviewed=await RatingAndReview.findOne({user:userId,course:courseId});
        if(alreadyReviewed) return res.status(500).json({success:false,message:"User has already reviewed this course"});
        //create rating and review
        const ratingReview=await RatingAndReview.create({
            rating,review,user:userId,course:courseId 
        })
        //update course
        const updatedCourse=await Course.findByIdAndUpdate(courseId,{$push:{ratingAndReviews:ratingReview._id}},{returnDocument:"after"});
        console.log(updatedCourse);

         //return response
        return res.status(200).json({
            success:true,
            message:"Rating and Review created Successfully",
            ratingReview,
        })
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}



exports.getAverageRating = async(req,res) => {

    try {
        const {courseId} = req.body;

        const result = await RatingAndReview.aggregate([
            {
                $match: {
                    course:new mongoose.Types.ObjectId(courseId)
                }
            },
            {
                $group:{
                    _id:null,
                    averageRating : {$avg :"$rating"}
                }
            }
        ])

        if (result.length>0) {
            return res.status(200).json({
                success:true,
                message:'Avg rating recived for the course',
                averageRating: result[0].averageRating
            })
        }
        return res.status(200).json({
            success:true,
            message:'Average Rating is 0, no ratings given till now',
            averageRating:0,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
    

}

exports.getAllRating = async (req, res) => {
    try{
            const allReviews = await RatingAndReview.find({})
                                    .sort({rating: "desc"})
                                    .populate({
                                        path:"user",
                                        select:"firstName lastName email image",
                                    })
                                    .populate({
                                        path:"course",
                                        select: "courseName",
                                    })
                                    .exec();
            return res.status(200).json({
                success:true,
                message:"All reviews fetched successfully",
                data:allReviews,
            });
    }   
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    } 
}
