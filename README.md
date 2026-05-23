# NavGurukul Learning Hub

An advanced, role-based e-learning platform built to streamline the educational experience for Students, Mentors, and Administrators. This platform features comprehensive progress tracking, an interactive curriculum library, automated certificate generation, and powerful analytical dashboards.

## 🌟 Key Features

### 🎓 Student Portal
- **Interactive Dashboard**: Real-time progress tracking, study hour calculations, active courses, and personalized learning recommendations.
- **Curriculum Library**: Browse, search, filter, and enroll in available courses.
- **Enrolled Courses**: Pick up right where you left off with an overview of ongoing courses.
- **Immersive Lesson Viewer**: Supports video playback, interactive quizzes, and a built-in PDF Viewer that bypasses standard restrictions.
- **Certificates & Streaks**: Maintain learning streaks and claim customized certificates upon completing a course and its final quiz.

### 👨‍🏫 Mentor Portal
- **Student Monitoring**: Track the progress and activity of assigned students.
- **Performance Analytics**: View granular data on how students are interacting with course materials.
- **Certification Management**: Review completions and officially generate/approve student certificates.

### 👑 Admin Portal
- **Platform Analytics**: High-level overview of the entire system (total users, course completion rates, active sessions).
- **Bulk Data Management**: Upload and manage Students, Courses, Lessons, and Progress records directly via CSV/Excel uploads.

## 📸 Screenshots

### Student Portal & Dashboard
![Student Dashboard](https://res.cloudinary.com/dbsg3chsc/image/upload/v1779529157/Screenshot_2026-05-23_122903_rqndsy.png)

![Student Course View](https://res.cloudinary.com/dbsg3chsc/image/upload/v1779529157/Screenshot_2026-05-23_150511_pe0fnt.png)

### Mentor Portal
![Mentor Dashboard](https://res.cloudinary.com/dbsg3chsc/image/upload/v1779529157/Screenshot_2026-05-23_150643_t9jymx.png)

### Admin Portal
![Admin Dashboard](https://res.cloudinary.com/dbsg3chsc/image/upload/v1779529157/Screenshot_2026-05-23_150617_qoi1vm.png)

### Course Completion Certificate
![Certificate](https://res.cloudinary.com/dbsg3chsc/image/upload/v1779529157/Screenshot_2026-05-23_150527_vbejer.png)

## 🛠️ Technology Stack

- **Frontend**: React (Vite), Tailwind CSS, React Router, Recharts (for analytics visualizations)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JSON Web Tokens (JWT) & HTTP-only cookies

## 📂 Folder Structure

```text
navgurukul-FSD/
├── Backend/                 # Express.js Server
│   ├── controllers/         # Business logic (auth, courses, analytics, etc.)
│   ├── middleware/          # JWT protection and Role-based authorization
│   ├── models/              # Mongoose DB Schemas (User, Course, Progress, Activity)
│   ├── routes/              # Express API Routes
│   ├── seed/                # DB Seeding scripts
│   └── server.js            # Entry point for backend
│
└── Frontend/                # React Vite App
    └── vite-project/
        ├── src/
        │   ├── api/         # Axios configurations and API endpoint maps
        │   ├── components/  # Reusable UI elements (CourseCard, StatCard, Modals)
        │   ├── context/     # React Context for Global Authentication State
        │   ├── layouts/     # Dashboard layout containing Sidebar & Topbar
        │   ├── pages/       # Role-based pages (admin, mentor, student)
        │   ├── routes/      # ProtectedRoute & RoleRoute guards
        │   └── App.jsx      # Main application router
        ├── index.html
        └── vite.config.js
```

## 🚀 How to Run Locally

### 1. Clone the repository
```bash
git clone <repository-url>
cd navgurukul-FSD
```

### 2. Setup Backend
```bash
cd Backend
npm install
```
- Create a `.env` file in the `Backend` directory and add your environment variables (e.g., `MONGO_URI`, `JWT_SECRET`, `PORT`).
- Start the backend server:
```bash
npm run dev
```

### 3. Setup Frontend
```bash
cd ../Frontend/vite-project
npm install
```
- Create a `.env` file in the `vite-project` directory and set the API URL (e.g., `VITE_API_URL=http://localhost:5000/api`).
- Start the frontend development server:
```bash
npm run dev
```

### 4. Access the App
Open your browser and navigate to `http://localhost:5173`.
