const express = require("express")
const router = express.Router()
const Personality = require("../models/Personality")

// GET /api/personality — Get all personality records
router.get("/", async (req, res) => {
    try {
        const records = await Personality.find().populate("userId", "name email").select("-__v")
        res.json({ success: true, count: records.length, data: records })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
})

// GET /api/personality/:id — Get by ID
router.get("/:id", async (req, res) => {
    try {
        const record = await Personality.findById(req.params.id).populate("userId", "name email")
        if (!record) {
            return res.status(404).json({ success: false, message: "Personality record not found" })
        }
        res.json({ success: true, data: record })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
})

// POST /api/personality — Create personality record
router.post("/", async (req, res) => {
    try {
        const { userId, traits, rawText } = req.body

        if (!userId) {
            return res.status(400).json({ success: false, message: "userId is required" })
        }

        const record = await Personality.create({ userId, traits, rawText })
        res.status(201).json({ success: true, data: record })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
})

// PUT /api/personality/:id — Update personality record
router.put("/:id", async (req, res) => {
    try {
        const record = await Personality.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        })
        if (!record) {
            return res.status(404).json({ success: false, message: "Personality record not found" })
        }
        res.json({ success: true, data: record })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
})

// DELETE /api/personality/:id — Delete personality record
router.delete("/:id", async (req, res) => {
    try {
        const record = await Personality.findByIdAndDelete(req.params.id)
        if (!record) {
            return res.status(404).json({ success: false, message: "Personality record not found" })
        }
        res.json({ success: true, message: "Personality record deleted" })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
})

module.exports = router
