require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const User = require("../models/User");
const Course = require("../models/Course");
const Lesson = require("../models/Lesson");
const Progress = require("../models/Progress");
const Activity = require("../models/Activity");

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB");
};

const seedData = async () => {
  await connectDB();

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Course.deleteMany({}),
    Lesson.deleteMany({}),
    Progress.deleteMany({}),
    Activity.deleteMany({}),
  ]);
  console.log("🗑️  Cleared existing data");

  // Create Admin
  const admin = await User.create({
    name: "Admin User",
    email: "admin@navgurukul.org",
    password: "Admin@123",
    role: "admin",
    streak: 5,
  });

  // Create Mentors (use create() so pre-save hook fires for hashing)
  const mentor1 = await User.create({ name: "Priya Sharma", email: "priya@navgurukul.org", password: "Mentor@123", role: "mentor", streak: 12 });
  const mentor2 = await User.create({ name: "Rahul Verma", email: "rahul@navgurukul.org", password: "Mentor@123", role: "mentor", streak: 8 });
  const mentors = [mentor1, mentor2];

  // Create Students
  const students = await Promise.all([
    User.create({ name: "Arjun Kumar", email: "arjun@student.com", password: "Student@123", role: "student", streak: 7, lastActivityDate: new Date() }),
    User.create({ name: "Sneha Patel", email: "sneha@student.com", password: "Student@123", role: "student", streak: 14, lastActivityDate: new Date() }),
    User.create({ name: "Rohan Mehta", email: "rohan@student.com", password: "Student@123", role: "student", streak: 3, lastActivityDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) }),
    User.create({ name: "Kavya Reddy", email: "kavya@student.com", password: "Student@123", role: "student", streak: 21, lastActivityDate: new Date() }),
    User.create({ name: "Demo Student", email: "student@demo.com", password: "Student@123", role: "student", streak: 5, lastActivityDate: new Date() }),
  ]);

  console.log("👥 Users created");

  // Create Courses
  const courses = await Course.insertMany([
    { title: "React.js Fundamentals", description: "Master modern React with hooks, context, and best practices.", mentorId: mentors[0]._id, category: "Web Development", difficulty: "Beginner", totalLessons: 10, duration: 300, tags: ["react", "javascript", "frontend"], enrolledCount: 45 },
    { title: "Node.js & Express API", description: "Build robust REST APIs with Node.js, Express, and MongoDB.", mentorId: mentors[1]._id, category: "Web Development", difficulty: "Intermediate", totalLessons: 8, duration: 240, tags: ["nodejs", "express", "backend"], enrolledCount: 38 },
    { title: "MongoDB & Mongoose", description: "Deep dive into MongoDB with aggregation pipelines and Mongoose ORM.", mentorId: mentors[0]._id, category: "Web Development", difficulty: "Intermediate", totalLessons: 6, duration: 180, tags: ["mongodb", "database"], enrolledCount: 29 },
    { title: "Python for Data Science", description: "Learn Python, NumPy, Pandas, and Matplotlib for data analysis.", mentorId: mentors[1]._id, category: "Data Science", difficulty: "Beginner", totalLessons: 12, duration: 360, tags: ["python", "data science"], enrolledCount: 52 },
    { title: "Machine Learning Basics", description: "Introduction to ML algorithms, scikit-learn, and model evaluation.", mentorId: mentors[0]._id, category: "AI/ML", difficulty: "Advanced", totalLessons: 10, duration: 420, tags: ["ml", "python", "ai"], enrolledCount: 21 },
    { title: "UI/UX Design Principles", description: "Learn design thinking, wireframing, and Figma for modern UI.", mentorId: mentors[1]._id, category: "Design", difficulty: "Beginner", totalLessons: 8, duration: 200, tags: ["design", "figma", "ux"], enrolledCount: 33 },
  ]);

  console.log("📚 Courses created");

  // Create Lessons for each course
  const lessonTitles = {
    0: ["Introduction to React", "JSX & Components", "Props & State", "useEffect Hook", "useState Hook", "Context API", "React Router", "Custom Hooks", "Performance Optimization", "Deploying React Apps"],
    1: ["Intro to Node.js", "Setting up Express", "REST API Design", "Middleware", "JWT Authentication", "Error Handling", "MongoDB Integration", "Deployment"],
    2: ["MongoDB Basics", "CRUD Operations", "Aggregation Pipeline", "$match & $group", "$project & $sort", "Mongoose Models"],
    3: ["Python Basics", "Variables & Data Types", "Lists & Dictionaries", "Functions", "NumPy Arrays", "Pandas DataFrames", "Data Cleaning", "Visualization", "Statistical Analysis", "Mini Project", "EDA", "Final Project"],
    4: ["ML Fundamentals", "Linear Regression", "Logistic Regression", "Decision Trees", "Random Forest", "SVM", "K-Means Clustering", "Model Evaluation", "Overfitting", "Final Project"],
    5: ["Design Thinking", "Color Theory", "Typography", "Wireframing", "Prototyping in Figma", "User Research", "Usability Testing", "Portfolio Project"],
  };

  const allLessons = [];
  for (let ci = 0; ci < courses.length; ci++) {
    const titles = lessonTitles[ci];
    for (let li = 0; li < titles.length; li++) {
      allLessons.push({
        title: titles[li],
        courseId: courses[ci]._id,
        duration: Math.floor(Math.random() * 30) + 15,
        order: li + 1,
        type: li === 8 ? "pdf" : (li % 4 === 3 ? "quiz" : "video"),
        pdfUrl: li === 8 ? "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" : "",
      });
    }
  }
  const lessons = await Lesson.insertMany(allLessons);
  console.log(`📖 ${lessons.length} Lessons created`);

  // Update course totalLessons
  for (let ci = 0; ci < courses.length; ci++) {
    await Course.findByIdAndUpdate(courses[ci]._id, { totalLessons: lessonTitles[ci].length });
  }

  // Create Progress records (simulate students taking courses)
  const progressRecords = [];
  const activityRecords = [];
  const demoStudent = students[4]; // Demo Student

  // Demo student — enrolled in React & Node courses with realistic progress
  const reactLessons = lessons.filter((l) => l.courseId.toString() === courses[0]._id.toString());
  const nodeLessons = lessons.filter((l) => l.courseId.toString() === courses[1]._id.toString());
  const pythonLessons = lessons.filter((l) => l.courseId.toString() === courses[3]._id.toString());

  // React course: 8/10 completed
  for (let i = 0; i < reactLessons.length; i++) {
    const daysAgo = reactLessons.length - i;
    const completedAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    progressRecords.push({
      studentId: demoStudent._id,
      courseId: courses[0]._id,
      lessonId: reactLessons[i]._id,
      completed: i < 8,
      timeSpent: Math.floor(Math.random() * 40) + 15,
      startedAt: new Date(completedAt.getTime() - 5 * 60 * 1000),
      completedAt: i < 8 ? completedAt : undefined,
    });
    if (i < 8) {
      activityRecords.push({
        userId: demoStudent._id,
        type: "LESSON_COMPLETED",
        courseId: courses[0]._id,
        lessonId: reactLessons[i]._id,
        createdAt: completedAt,
      });
    }
  }

  // Node course: 5/8 completed
  for (let i = 0; i < nodeLessons.length; i++) {
    const daysAgo = nodeLessons.length - i + 2;
    const completedAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    progressRecords.push({
      studentId: demoStudent._id,
      courseId: courses[1]._id,
      lessonId: nodeLessons[i]._id,
      completed: i < 5,
      timeSpent: Math.floor(Math.random() * 40) + 20,
      startedAt: new Date(completedAt.getTime() - 5 * 60 * 1000),
      completedAt: i < 5 ? completedAt : undefined,
    });
    if (i < 5) {
      activityRecords.push({
        userId: demoStudent._id,
        type: "LESSON_COMPLETED",
        courseId: courses[1]._id,
        lessonId: nodeLessons[i]._id,
        createdAt: completedAt,
      });
    }
  }

  // Python: 3/12 completed
  for (let i = 0; i < Math.min(pythonLessons.length, 4); i++) {
    const daysAgo = 20 - i * 3;
    const completedAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    progressRecords.push({
      studentId: demoStudent._id,
      courseId: courses[3]._id,
      lessonId: pythonLessons[i]._id,
      completed: i < 3,
      timeSpent: Math.floor(Math.random() * 35) + 10,
      startedAt: new Date(completedAt.getTime() - 5 * 60 * 1000),
      completedAt: i < 3 ? completedAt : undefined,
    });
    if (i < 3) {
      activityRecords.push({
        userId: demoStudent._id,
        type: "LESSON_COMPLETED",
        courseId: courses[3]._id,
        lessonId: pythonLessons[i]._id,
        createdAt: completedAt,
      });
    }
  }

  // Other students — spread across courses
  for (const student of students.slice(0, 4)) {
    const enrolledCourses = courses.slice(0, 3);
    for (const course of enrolledCourses) {
      const courseLessons = lessons.filter((l) => l.courseId.toString() === course._id.toString());
      const completedCount = Math.floor(Math.random() * courseLessons.length);
      for (let i = 0; i < completedCount; i++) {
        const daysAgo = Math.floor(Math.random() * 30);
        const completedAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
        progressRecords.push({
          studentId: student._id,
          courseId: course._id,
          lessonId: courseLessons[i]._id,
          completed: true,
          timeSpent: Math.floor(Math.random() * 45) + 10,
          completedAt,
        });
        activityRecords.push({
          userId: student._id,
          type: "LESSON_COMPLETED",
          courseId: course._id,
          lessonId: courseLessons[i]._id,
          createdAt: completedAt,
        });
      }
    }
  }

  await Progress.insertMany(progressRecords, { ordered: false }).catch(() => {});
  await Activity.insertMany(activityRecords, { ordered: false }).catch(() => {});
  console.log(`✅ ${progressRecords.length} Progress records & ${activityRecords.length} Activity logs created`);

  console.log("\n🎉 Database seeded successfully!\n");
  console.log("═══════════════════════════════════════");
  console.log("📧 Login Credentials:");
  console.log("  Admin   → admin@navgurukul.org / Admin@123");
  console.log("  Mentor  → priya@navgurukul.org / Mentor@123");
  console.log("  Student → student@demo.com / Student@123");
  console.log("═══════════════════════════════════════\n");

  process.exit(0);
};

seedData().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
