const SubSection=require('../models/SubSection');
const Section=require('../models/Section');
const {uploadImageToCloudinary}=require('../utils/imageUploader');
require('dotenv').config();
exports.createSubSection=async (req,res)=>{
    try{
        const {title,description,sectionId}=req.body;
        const video=req.files?.video ?? req.files?.videoFile;

        if(!title || !description || !sectionId || !video){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            })
        }

        const sectionDetails = await Section.findById(sectionId);
        if(!sectionDetails){
            return res.status(404).json({
                success:false,
                message:"Section not found"
            })
        }

        //upload to cloudinary
        const uploadDetails=await uploadImageToCloudinary(video,process.env.FOLDER_NAME);

        const subSectionDetails=await SubSection.create({
            title:title,
            timeDuration:`${uploadDetails.duration || 0}`,
            description:description,
            videoUrl:uploadDetails.secure_url,
            
        });

        const updatedSection=await Section.findByIdAndUpdate(sectionId,{
            $push:{subSection:subSectionDetails._id}
        },{returnDocument:"after"}).populate('subSection');

        return res.status(200).json({
            success:true,
            message:'SubSection created successfully',
            data: updatedSection,
            updatedSection
        })   
        
    }
    catch(err){
        console.error(err);
        return res.status(500).json({
            success:false,
            message:`Something went wrong while creating SubSection: ${err.message}`
        })
    }
}


exports.updateSubSection = async (req, res) => {
    try {
      const { sectionId,subSectionId, title, description } = req.body
      const subSection = await SubSection.findById(subSectionId)
  
      if (!subSection) {
        return res.status(404).json({
          success: false,
          message: "SubSection not found",
        })
      }
  
      if (title !== undefined) {
        subSection.title = title
      }
  
      if (description !== undefined) {
        subSection.description = description
      }
      const video = req.files?.video ?? req.files?.videoFile
      if (video) {
        const uploadDetails = await uploadImageToCloudinary(
          video,
          process.env.FOLDER_NAME
        )
        subSection.videoUrl = uploadDetails.secure_url
        subSection.timeDuration = `${uploadDetails.duration}`
      }
  
      await subSection.save()
  
      const updatedSection = await Section.findById(sectionId).populate("subSection")


      return res.json({
        success: true,
        data:updatedSection,
        message: "Section updated successfully",
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: `An error occurred while updating the section: ${error.message}`,
      })
    }
  }

exports.deleteSubSection = async (req,res) =>{
    try {
        
        const {subSectionId,sectionId } = req.body;
        if(!subSectionId) {
            return res.status(400).json({
                success:false,
                message:'SubSection Id to be deleted is required',
            });
        }
        await Section.findByIdAndUpdate(
            { _id: sectionId },
            {
              $pull: {
                subSection: subSectionId,
              },
            }
          )


        
        const subSection = await SubSection.findByIdAndDelete({ _id: subSectionId })
  
      if (!subSection) {
        return res
          .status(404)
          .json({ success: false, message: "SubSection not found" })
      }

      const updatedSection = await Section.findById(sectionId).populate("subSection")
  
      return res.json({
        success: true,
        data:updatedSection,
        message: "SubSection deleted successfully",
      })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success:false,
            message:'Failed to delete SubSection',
            error: error.message,
        })
    }
}
