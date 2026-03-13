const mongoose = require("mongoose")

const personalitySchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        traits: {
            openness: { type: Number, min: 0, max: 100, default: 0 },
            conscientiousness: { type: Number, min: 0, max: 100, default: 0 },
            extraversion: { type: Number, min: 0, max: 100, default: 0 },
            agreeableness: { type: Number, min: 0, max: 100, default: 0 },
            neuroticism: { type: Number, min: 0, max: 100, default: 0 },
        },
        rawText: {
            type: String,
            default: "",
        },
        analysisDate: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
)

module.exports = mongoose.model("Personality", personalitySchema)
