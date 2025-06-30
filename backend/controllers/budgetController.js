import Budget from "../models/Budget.js"

export const setOrUpdateBudget = async (req, res) => {
	try {
		const {category, monthlyLimit} = req.body
		let budget = await Budget.findOneAndUpdate({user: req.user.id, category}, {monthlyLimit}, {new: true})
		if (!budget) {
			budget = await Budget.create({user: req.user.id, category, monthlyLimit})
		}
		res.json(budget)
	} catch (err) {
		res.status(500).json({message: "Server error", error: err.message})
	}
}

export const getBudgets = async (req, res) => {
	try {
		const budgets = await Budget.find({user: req.user.id})
		res.json(budgets)
	} catch (err) {
		res.status(500).json({message: "Server error", error: err.message})
	}
}
