const express = require("express");
const router = express.Router();
const {
  getProgressAnalytics,
  getTimeSeries,
  getCourseDistribution,
  getActivityFeed,
  getRecommendations,
} = require("../controllers/analyticsController");
const { protect, authorize } = require("../middleware/auth");

router.get("/progress", protect, authorize("student"), getProgressAnalytics);
router.get("/timeseries", protect, authorize("student"), getTimeSeries);
router.get("/distribution", protect, authorize("student"), getCourseDistribution);
router.get("/activity", protect, getActivityFeed);
router.get("/recommendations", protect, authorize("student"), getRecommendations);

module.exports = router;
