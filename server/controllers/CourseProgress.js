const CourseProgress = require("../models/CourseProgress");
const SubSection = require("../models/SubSection");

exports.updateCourseProgress = async (req,res) => {
    console.log("Controller reached for updating course progress");
    const {courseId, subsectionId} = req.body;
    const userId = req.user.id;

    console.log("courseId =", courseId);
    console.log("subsectionId =", subsectionId);
    console.log("userId =", userId);
    try {
        const subSection = await SubSection.findById(subsectionId);
        console.log("subSection =", subSection);

        if(!subSection){
            return res.status(404).json({
                error:"Invalid SubSection"
            })
        }

        let courseProgress = await CourseProgress.findOne({
            courseID:courseId,
            userId:userId
        })
        console.log("courseProgress =", courseProgress);

        if (!courseProgress) {
            return res.status(404).json({
                error:"Course Progress does not exist"
            })
        }
        else{
            if (courseProgress.completedVideos.includes(subsectionId)) {
                return res.status(200).json({
                    success:false,
                    message:"Video already completed"
                })
            }

            courseProgress.completedVideos.push(subsectionId);
            console.log("Course Progress Push Done");
        }
        await courseProgress.save();
        console.log("Course Progress Save call Done");
        return res.status(200).json({
            success:true,
            message:"Course Progress Updated Successfully",
        })
    } catch (error) {
        console.error(error);
        return res.status(400).json({error:"Internal Server Error"});
    }



}