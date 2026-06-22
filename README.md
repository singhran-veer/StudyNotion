# 🎓 StudyNotion – Full Stack EdTech Platform

StudyNotion is a full-stack Learning Management System (LMS) built using the MERN stack. It provides a seamless learning experience for students and powerful course management tools for instructors. The platform supports secure authentication, role-based authorization, online payments, media uploads, course progress tracking, and reviews.

---

## 🚀 Live Demo

### 🌐 Frontend
🔗 https://studynotion-frontend-zeta-tawny.vercel.app/

### ⚙️ Backend API
🔗 https://studynotion-backend-qyfw.onrender.com

---

## ✨ Features

### 👨‍🎓 Student Features
- User Registration and Login
- OTP Email Verification
- Browse Available Courses
- Course Details Page
- Add Courses to Cart
- Razorpay Payment Integration
- Course Enrollment
- Watch Lectures
- Track Course Progress
- Rate and Review Courses
- Edit Profile and Update Password

### 👨‍🏫 Instructor Features
- Instructor Dashboard
- Create Courses
- Edit Course Information
- Upload Thumbnails and Videos
- Create Sections and Lectures
- Publish Courses
- Monitor Course Performance

### 🔒 Authentication & Authorization
- JWT Token-based Authentication
- Role-Based Access Control
- Student Routes
- Instructor Routes
- Protected APIs using Middleware
- Password Hashing with Bcrypt
- Forgot Password and Reset Password
- Secure Token Verification

---

## 🛠 Tech Stack

### Frontend
- React.js
- Redux Toolkit
- React Router DOM
- Tailwind CSS
- Axios
- Swiper.js
- Chart.js

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- Bcrypt
- Nodemailer
- Cloudinary
- Razorpay

### Deployment
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

---

## 📂 Project Structure

```text
StudyNotion
│
├── src/                  # React Frontend
├── public/
├── server/               # Express Backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middlewares/
│   ├── config/
│   └── utils/
│
├── package.json
└── README.md
```

---

## 🔑 Core Functionalities

### Authentication
- Signup with OTP verification
- Login using JWT tokens
- Forgot Password
- Reset Password

### Authorization
- Role-based protected routes
- Student access control
- Instructor access control
- JWT verification middleware

### Course Management
- Create Courses
- Update Courses
- Delete Courses
- Add Sections
- Add Subsections
- Upload Videos and Thumbnails

### Payments
- Razorpay Checkout Integration
- Payment Verification
- Course Enrollment after Successful Payment

### Media Management
- Cloudinary Image Upload
- Cloudinary Video Upload

### User Features
- Course Progress Tracking
- Ratings and Reviews
- Dashboard Analytics
- Profile Management

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/singhran-veer/StudyNotion.git
cd StudyNotion
```

### Install Frontend Dependencies

```bash
npm install
```

### Install Backend Dependencies

```bash
cd server
npm install
```

---

## 🔐 Environment Variables

### Frontend (.env.local)

```env
VITE_APP_BASE_URL=
VITE_RAZORPAY_KEY=
```

### Backend (.env)

```env
PORT=

MONGODB_URL=
JWT_SECRET=

MAIL_HOST=
MAIL_USER=
MAIL_PASS=

CLOUD_NAME=
API_KEY=
API_SECRET=
FOLDER_NAME=

RAZORPAY_KEY=
RAZORPAY_SECRET=
```

---

## ▶ Running Locally

### Frontend

```bash
npm run dev
```

### Backend

```bash
cd server
npm run dev
```

---

## 📸 Major Modules

- Authentication System
- Role-Based Authorization
- Course Creation and Management
- Video Upload and Streaming
- Razorpay Payment Gateway
- Student Dashboard
- Instructor Dashboard
- Course Progress Tracking
- Ratings and Reviews
- Profile Management

---

## 🚀 Future Enhancements

- Admin Dashboard
- AI-Based Course Recommendation
- Real-time Chat System
- Certificates of Completion
- Wishlist Feature
- Discussion Forum
- Mobile Application

---

## 👨‍💻 Author

### Ranveer Singh

- GitHub: https://github.com/singhran-veer

---

## ⭐ Support

If you found this project useful, consider giving the repository a ⭐ to support the project.
