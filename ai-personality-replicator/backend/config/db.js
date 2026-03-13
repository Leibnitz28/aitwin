const mongoose = require("mongoose")

const connectDB = async () => {
  try {
    console.log("🔄 Connecting to MongoDB...")

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    })

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
    console.log(`📦 Database: ${conn.connection.name}`)
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message)
    console.error("\n💡 Troubleshooting tips:")
    console.error("  1. Whitelist your IP in MongoDB Atlas → Network Access")
    console.error("  2. Verify your credentials in .env")
    console.error("  3. Check your internet connection")
    process.exit(1)
  }
}

module.exports = connectDB