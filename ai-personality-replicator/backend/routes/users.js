const express = require("express")
const router = express.Router()
const User = require("../models/User")

// GET /api/users — Get all users
router.get("/", async (req, res) => {
    try {
        const users = await User.find().select("-__v")
        res.json({ success: true, count: users.length, data: users })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
})

// GET /api/users/:id — Get user by ID
router.get("/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-__v")
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" })
        }
        res.json({ success: true, data: user })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
})

// POST /api/users — Create a new user
router.post("/", async (req, res) => {
    try {
        const { name, email, personalityTraits } = req.body

        if (!name || !email) {
            return res
                .status(400)
                .json({ success: false, message: "Name and email are required" })
        }

        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res
                .status(400)
                .json({ success: false, message: "Email already exists" })
        }

        const user = await User.create({ name, email, personalityTraits })
        res.status(201).json({ success: true, data: user })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
})

// PUT /api/users/:id — Update user
router.put("/:id", async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        })
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" })
        }
        res.json({ success: true, data: user })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
})

// DELETE /api/users/:id — Delete user
router.delete("/:id", async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id)
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" })
        }
        res.json({ success: true, message: "User deleted successfully" })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
})

module.exports = router
