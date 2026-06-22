const express=require("express");
const app=express();

const userRoutes=require("./routes/User");
const profileRoutes=require("./routes/Profile");
const courseRoutes=require("./routes/Course");
const paymentRoutes=require("./routes/Payments");
const contactUsRoute = require("./routes/Contact");

const database=require("./config/database");
const cookieParser=require("cookie-parser");
const cors=require("cors");
const {cloudinaryConnect}=require("./config/cloudinary");
const fileUpload=require("express-fileupload");
const fs=require("fs");
const path=require("path");
require("dotenv").config();

const PORT=process.env.PORT || 4000;
const uploadTempDir=path.join(__dirname, "tmp");

if (!fs.existsSync(uploadTempDir)) {
    fs.mkdirSync(uploadTempDir, { recursive: true });
}

database.connect();
cloudinaryConnect();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin:true,
    credentials:true
}));

app.use(fileUpload({
    useTempFiles:true,
    tempFileDir: uploadTempDir
}));

app.use("/api/v1/auth",userRoutes);
app.use("/api/v1/profile",profileRoutes);
app.use("/api/v1/course",courseRoutes);
app.use("/api/v1/payment",paymentRoutes);
app.use("/api/v1/reach", contactUsRoute);

app.get("/", (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Server is running",
    });
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
