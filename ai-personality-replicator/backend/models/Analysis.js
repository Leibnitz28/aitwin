const mongoose = require("mongoose")

const analysisSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        personalityId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Personality",
        },
        results: {
            summary: { type: String, default: "" },
            dominantTrait: { type: String, default: "" },
            insights: [String],
        },
        confidence: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
        },
        inputType: {
            type: String,
            enum: ["text", "voice", "both"],
            default: "text",
        },
    },
    { timestamps: true }
)

module.exports = mongoose.model("Analysis", analysisSchema)
