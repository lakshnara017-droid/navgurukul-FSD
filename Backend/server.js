require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/courses", require("./routes/courseRoutes"));
app.use("/api/lessons", require("./routes/lessonRoutes"));
app.use("/api/progress", require("./routes/progressRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));
app.use("/api/mentor", require("./routes/mentorRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/certificates", require("./routes/certificateRoutes"));

// Health check
app.get("/", (req, res) => res.json({ message: "Student Dashboard API Running 🚀" }));

// PDF Proxy Route to bypass X-Frame-Options & CSP blocks
app.get("/api/proxy/pdf", (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send("No URL provided");
  
  const client = targetUrl.startsWith("https") ? require("https") : require("http");
  
  client.get(targetUrl, (proxyRes) => {
    // If it's a redirect, we ideally should follow it, but for simple PDFs direct link usually works.
    if (proxyRes.statusCode >= 300 && proxyRes.statusCode < 400 && proxyRes.headers.location) {
      return res.redirect("/api/proxy/pdf?url=" + encodeURIComponent(proxyRes.headers.location));
    }
    
    res.setHeader("Content-Type", "application/pdf");
    
    // Strip out the framing restrictions
    const headers = { ...proxyRes.headers };
    delete headers['x-frame-options'];
    delete headers['content-security-policy'];
    delete headers['strict-transport-security'];
    
    Object.keys(headers).forEach(key => {
      try { res.setHeader(key, headers[key]); } catch (e) {}
    });
    
    proxyRes.pipe(res);
  }).on("error", (err) => {
    console.error("PDF Proxy Error:", err.message);
    res.status(500).send("Failed to proxy PDF");
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || "Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));