const cloudinary=require("cloudinary").v2;
const fs=require("fs");

exports.uploadImageToCloudinary=async (file,folder,height,quality)=>{
    try {
        const options={folder};
        if(height) options.height=height;
        if(quality) options.quality=quality;

        options.resource_type="auto";

        let uploadSource=file?.tempFilePath;

        if(uploadSource && !fs.existsSync(uploadSource)){
            uploadSource=null;
        }

        if(!uploadSource && file?.data?.length){
            uploadSource=`data:${file.mimetype};base64,${file.data.toString("base64")}`;
        }

        if(!uploadSource){
            throw new Error("Uploaded file could not be read from the server");
        }

        const result=await cloudinary.uploader.upload(uploadSource,options);

        if(!result?.secure_url){
            throw new Error(result?.message || result?.error?.message || "Cloudinary upload failed");
        }

        return result;
    }
    catch(error){
        const message=error?.message || error?.error?.message || JSON.stringify(error) || "Cloudinary upload failed";
        throw new Error(message);
    }
}
