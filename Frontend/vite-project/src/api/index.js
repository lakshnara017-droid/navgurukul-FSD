import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────
export const authAPI = {
  register: (data) => API.post("/auth/register", data),
  login: (data) => API.post("/auth/login", data),
  getMe: () => API.get("/auth/me"),
  updateProfile: (data) => API.put("/auth/profile", data),
};

// ── Courses ───────────────────────────────────────
export const coursesAPI = {
  getAll: (params) => API.get("/courses", { params }),
  getById: (id) => API.get(`/courses/${id}`),
  getEnrolled: () => API.get("/courses/enrolled"),
  create: (data) => API.post("/courses", data),
};

// ── Lessons ───────────────────────────────────────
export const lessonsAPI = {
  getById: (id) => API.get(`/lessons/${id}`),
  start: (lessonId) => API.post("/lessons/start", { lessonId }),
  updateTime: (lessonId, timeSpent) => API.post("/lessons/update-time", { lessonId, timeSpent }),
  complete: (lessonId, timeSpent) => API.post("/lessons/complete", { lessonId, timeSpent }),
  update: (id, data) => API.patch(`/lessons/${id}`, data),
  create: (data) => API.post("/lessons", data),
};

// ── Progress ──────────────────────────────────────
export const progressAPI = {
  getMy: () => API.get("/progress"),
  getCourse: (courseId) => API.get(`/progress/course/${courseId}`),
};

// ── Analytics ─────────────────────────────────────
export const analyticsAPI = {
  getProgress: () => API.get("/analytics/progress"),
  getTimeSeries: (days) => API.get("/analytics/timeseries", { params: { days } }),
  getDistribution: () => API.get("/analytics/distribution"),
  getActivity: (page) => API.get("/analytics/activity", { params: { page } }),
  getRecommendations: () => API.get("/analytics/recommendations"),
};

// ── Mentor ────────────────────────────────────────
export const mentorAPI = {
  getStudents: (params) => API.get("/mentor/students", { params }),
  getStudent: (id) => API.get(`/mentor/student/${id}`),
  exportStudents: () => API.get("/mentor/export/students", { responseType: "blob" }),
};

// ── Admin ─────────────────────────────────────────
export const adminAPI = {
  getStats: () => API.get("/admin/stats"),
  uploadStudents: (formData) => API.post("/admin/upload/students", formData),
  uploadCourses: (formData) => API.post("/admin/upload/courses", formData),
  uploadLessons: (formData) => API.post("/admin/upload/lessons", formData),
  uploadProgress: (formData) => API.post("/admin/upload/progress", formData),
};

export const certificatesAPI = {
  getPending: () => API.get("/certificates/pending"),
  getGenerated: () => API.get("/certificates/generated"),
  generate: (studentId, courseId) => API.post("/certificates/generate", { studentId, courseId }),
  claim: (courseId) => API.post("/certificates/claim", { courseId }),
  getMy: () => API.get("/certificates/my"),
  getMyStatus: (courseId) => API.get(`/certificates/my-status/${courseId}`),
};

export default API;
