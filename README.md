# StudyNotion - Full Stack EdTech Platform

StudyNotion is a full-stack Learning Management System built with the MERN stack. It supports student learning, instructor course management, authentication, payments, media uploads, progress tracking, and reviews.

## Live Demo

- Frontend: https://studynotion-frontend-zeta-tawny.vercel.app/
- Backend API: https://studynotion-backend-qyfw.onrender.com

## Features

### Student

- Registration and login
- OTP email verification
- Course browsing and details
- Cart and Razorpay payments
- Course enrollment and lecture viewing
- Progress tracking
- Course ratings and reviews
- Profile and password management

### Instructor

- Instructor dashboard
- Course creation and editing
- Thumbnail and video uploads
- Sections and lectures
- Course publishing
- Course performance monitoring

### Authentication and Security

- JWT authentication
- Role-based access control
- Protected student and instructor routes
- Bcrypt password hashing
- Forgot-password and reset-password flows
- Redis-backed OTP, reset-token, and rate-limit storage

## Redis Features

Redis stores short-lived authentication data and request counters. MongoDB remains the source of truth for users and application data.

### OTP storage

When a user requests signup verification, the server generates an OTP and stores it using:

```text
otp:signup:<normalized-email>
```

The OTP expires automatically after 120 seconds. It is deleted after successful verification, so it cannot be reused.

### Password-reset tokens

When a user requests a password-reset link, Redis stores the token-to-user mapping:

```text
password-reset:<token>
```

The token expires after 300 seconds and is deleted after a successful password change.

### Rate limiting

Authentication routes use Redis fixed-window counters:

| Key pattern | Limit | Window |
| --- | ---: | ---: |
| `rate-limit:login:<ip>:<email>` | 10 requests | 15 minutes |
| `rate-limit:send-otp:<ip>:<email>` | 3 requests | 10 minutes |
| `rate-limit:reset-token:<ip>:<email>` | 3 requests | 10 minutes |
| `rate-limit:reset-password:<ip>` | 10 requests | 10 minutes |

Blocked requests return HTTP `429` and include a `Retry-After` response header. Redis failures in the rate limiter return HTTP `503` rather than silently bypassing the protection.

## Tech Stack

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
- MongoDB and Mongoose
- JWT
- Bcrypt
- Nodemailer
- Redis
- Cloudinary
- Razorpay

### Deployment

- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas
- Redis: Docker locally or a hosted Redis service in production

## Project Structure

```text
StudyNotion
|- src/                  # React frontend
|- public/
|- server/               # Express backend
|  |- controllers/
|  |- models/
|  |- routes/
|  |- middlewares/
|  |- config/
|  `- utils/
|- package.json
`- README.md
```

## Installation

```bash
git clone https://github.com/singhran-veer/StudyNotion.git
cd StudyNotion
npm install
cd server
npm install
```

## Environment Variables

### Frontend `.env.local`

```env
VITE_APP_BASE_URL=http://localhost:4000/api/v1
VITE_RAZORPAY_KEY=
```

### Backend `.env`

```env
PORT=4000
MONGODB_URL=
JWT_SECRET_KEY=

MAIL_HOST=smtp.gmail.com
MAIL_USER=
MAIL_PASSWORD=

# Local Docker Redis
REDIS_URL=redis://127.0.0.1:6379

# Optional alternative for hosted Upstash Redis
# UPSTASH_REDIS_REST_URL=https://<instance>.upstash.io
# UPSTASH_REDIS_REST_TOKEN=<token>

# Used in password-reset links
FRONTEND_URL=http://localhost:3000

CLOUD_NAME=
API_KEY=
API_SECRET=
FOLDER_NAME=StudyNotion
RAZORPAY_KEY=
RAZORPAY_SECRET=
```

The server uses Upstash REST when both `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are present. Otherwise, it uses `REDIS_URL`.

Never commit environment files or expose Redis, SMTP, database, JWT, Cloudinary, or Razorpay secrets in frontend variables.

## Running Locally

Start Redis with Docker:

```bash
docker run -d --name studynotion-redis -p 6379:6379 redis:7-alpine
docker exec studynotion-redis redis-cli ping
```

The Redis check should return `PONG`.

Run the frontend and backend from the project root:

```bash
npm run dev
```

Or run them separately:

```bash
# Frontend
npm run client

# Backend
npm run server-dev
```

The frontend runs on `http://localhost:3000` and the backend runs on `http://localhost:4000`.

## Main Modules

- Authentication and authorization
- Course creation and management
- Video uploads and playback
- Razorpay payment processing
- Student and instructor dashboards
- Course progress tracking
- Ratings and reviews
- Profile management

## Author

Ranveer Singh - https://github.com/singhran-veer
