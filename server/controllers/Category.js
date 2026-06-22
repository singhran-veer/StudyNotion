const Category=require("../models/Category");
const Course=require("../models/Course");

//create tg ka handler fn
exports.createCategory=async (req,res)=>{
    try{
        const {name,description}=req.body;

        if(!name || !description){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            })
        }
        const category=await Category.create({name:name,description:description});
        return res.status(200).json({
            success:true,
            message:"Category created successfully",
            category
        })
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:`Something went wrong while creating Category , ${err}`
        })     
    }
}

//get all tags
exports.showAllCategories=async (req,res)=>{
    try{
        const allCategories=await Category.find({},{name:true,description:true});
        return res.status(200).json({
            success:true,
            message:"All categories fetched successfully",
            allCategories,
            data: allCategories,
        })
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:`Error in getting categories, ${err}`
        })
    }
}


//categoryPageDetails
function getRandomInt(max) {
    return Math.floor(Math.random() * max)
}

exports.categoryPageDetails = async (req,res) => {
    try {
        const { categoryId } = req.body
      console.log("PRINTING CATEGORY ID: ", categoryId);
      // Get courses for the specified category
      const selectedCategory = await Category.findById(categoryId)
        .populate({
          path: "course",
          match: { status: "Published" },
          populate: [
            { path: "ratingAndReviews" },
            { path: "instructor" },
          ],
        })
        .exec()
  
      //console.log("SELECTED COURSE", selectedCourses)
      // Handle the case when the category is not found
      if (!selectedCategory) {
        console.log("Category not found.")
        return res
          .status(404)
          .json({ success: false, message: "Category not found" })
      }
      // Get courses for other categories
      const categoriesExceptSelected = await Category.find({
        _id: { $ne: categoryId },
        course: { $not: { $size: 0 } }
      })
      console.log("categoriesExceptSelected", categoriesExceptSelected)
      let differentCategory = categoriesExceptSelected.length
        ? await Category.findById(
            categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]
              ._id
          )
        .populate({
          path: "course",
          match: { status: "Published" },
          populate: [
            { path: "ratingAndReviews" },
            { path: "instructor" },
          ],
        })
        .exec()
        : null
        //console.log("Different COURSE", differentCourses)
      // Get top-selling courses across all categories
      const allCategories = await Category.find()
        .populate({
          path: "course",
          match: { status: "Published" },
          populate: "ratingAndReviews",
        })
        .exec()
      const mostSellingCourses = await Course.find({ status: 'Published' })
      .sort({ "studentsEnrolled.length": -1 })
      .populate("ratingAndReviews")
      .populate("instructor") // Sort by studentsEnrolled array length in descending order
      .exec();

        res.status(200).json({
            success:true,
            data: {
                selectedCategory: {
                    ...selectedCategory.toObject(),
                    courses: selectedCategory.course,
                },
                differentCategory: differentCategory
                    ? {
                        ...differentCategory.toObject(),
                        courses: differentCategory.course,
                    }
                    : null,
                mostSellingCourses,
            }
		})
    } catch (error) {
        return res.status(500).json({
			success: false,
			message: "Internal server error",
			error: error.message,
		});
    }
}
