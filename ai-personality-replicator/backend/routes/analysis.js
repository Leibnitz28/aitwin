const express = require("express")
const router = express.Router()
const Analysis = require("../models/Analysis")

// GET /api/analysis — Get all analyses
router.get("/", async (req, res) => {
    try {
        const records = await Analysis.find()
            .populate("userId", "name email")
            .populate("personalityId")
            .select("-__v")
        res.json({ success: true, count: records.length, data: records })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
})

// GET /api/analysis/:id — Get by ID
router.get("/:id", async (req, res) => {
    try {
        const record = await Analysis.findById(req.params.id)
            .populate("userId", "name email")
            .populate("personalityId")
        if (!record) {
            return res.status(404).json({ success: false, message: "Analysis not found" })
        }
        res.json({ success: true, data: record })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
})

// POST /api/analysis — Create analysis
router.post("/", async (req, res) => {
    try {
        const { userId, personalityId, results, confidence, inputType } = req.body

        if (!userId) {
            return res.status(400).json({ success: false, message: "userId is required" })
        }

        const record = await Analysis.create({
            userId,
            personalityId,
            results,
            confidence,
            inputType,
        })
        res.status(201).json({ success: true, data: record })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
})

// DELETE /api/analysis/:id — Delete analysis
router.delete("/:id", async (req, res) => {
    try {
        const record = await Analysis.findByIdAndDelete(req.params.id)
        if (!record) {
            return res.status(404).json({ success: false, message: "Analysis not found" })
        }
        res.json({ success: true, message: "Analysis deleted" })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
})

module.exports = router
