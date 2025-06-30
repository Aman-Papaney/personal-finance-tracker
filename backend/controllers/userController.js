import User from "../models/User.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export const register = async (req, res) => {
	try {
		const {name, email, password} = req.body
		const userExists = await User.findOne({email})
		if (userExists) return res.status(400).json({message: "Email already registered"})
		const hashedPassword = await bcrypt.hash(password, 10)
		const user = await User.create({name, email, password: hashedPassword})
		res.status(201).json({message: "User registered successfully"})
	} catch (err) {
		res.status(500).json({message: "Server error", error: err.message})
	}
}

export const login = async (req, res) => {
	try {
		const {email, password} = req.body
		const user = await User.findOne({email})
		if (!user) return res.status(400).json({message: "Invalid credentials"})
		const isMatch = await bcrypt.compare(password, user.password)
		if (!isMatch) return res.status(400).json({message: "Invalid credentials"})
		const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET, {expiresIn: "7d"})
		res.json({token, user: {id: user._id, name: user.name, email: user.email}})
	} catch (err) {
		res.status(500).json({message: "Server error", error: err.message})
	}
}
