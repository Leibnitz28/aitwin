const mongoose = require("mongoose")

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/\S+@\S+\.\S+/, "Please enter a valid email"],
        },
        personalityTraits: {
            type: [String],
            default: [],
        },
        bio: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
)

module.exports = mongoose.model("User", userSchema)
