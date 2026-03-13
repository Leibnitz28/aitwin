require("dotenv").config()

const express = require("express")
const cors = require("cors")
const connectDB = require("./config/db")

// Import Routes
const userRoutes = require("./routes/users")
const personalityRoutes = require("./routes/personality")
const analysisRoutes = require("./routes/analysis")
const twinRoutes = require("./routes/twin")

const app = express()

// Connect to MongoDB
connectDB()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health Check Route
app.get("/", (req, res) => {
  res.json({
    message: "🧠 AI Personality Replicator API",
    status: "running",
    version: "1.0.0",
    endpoints: {
      users: "/api/users",
      personality: "/api/personality",
      analysis: "/api/analysis",
      twin: "/api/twin",
    },
  })
})

// API Routes
app.use("/api/users", userRoutes)
app.use("/api/personality", personalityRoutes)
app.use("/api/analysis", analysisRoutes)
app.use("/api/twin", twinRoutes)

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` })
})

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack)
  res.status(500).json({ success: false, message: "Internal Server Error" })
})

const PORT = process.env.PORT || 5001

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`)
  console.log(`📋 Available routes:`)
  console.log(`   GET  http://localhost:${PORT}/`)
  console.log(`   GET  http://localhost:${PORT}/api/users`)
  console.log(`   POST http://localhost:${PORT}/api/users`)
  console.log(`   GET  http://localhost:${PORT}/api/personality`)
  console.log(`   POST http://localhost:${PORT}/api/personality`)
  console.log(`   GET  http://localhost:${PORT}/api/analysis`)
  console.log(`   POST http://localhost:${PORT}/api/analysis`)
  console.log(`   POST http://localhost:${PORT}/api/twin/create-twin`)
  console.log(`   POST http://localhost:${PORT}/api/twin/chat`)
  console.log(`   POST http://localhost:${PORT}/api/twin/mint-identity`)
})