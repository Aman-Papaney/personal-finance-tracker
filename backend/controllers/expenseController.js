import Expense from "../models/Expense.js"

export const addExpense = async (req, res) => {
	try {
		const {amount, category, date, paymentMethod, description} = req.body
		const expense = await Expense.create({
			user: req.user.id,
			amount,
			category,
			date,
			paymentMethod,
			description,
		})
		res.status(201).json(expense)
	} catch (err) {
		res.status(500).json({message: "Server error", error: err.message})
	}
}

export const getExpenses = async (req, res) => {
	try {
		const {startDate, endDate, category, paymentMethod, search} = req.query
		let filter = {user: req.user.id}
		if (startDate && endDate) filter.date = {$gte: new Date(startDate), $lte: new Date(endDate)}
		if (category) filter.category = category
		if (paymentMethod) filter.paymentMethod = paymentMethod
		if (search) filter.$or = [{category: {$regex: search, $options: "i"}}, {paymentMethod: {$regex: search, $options: "i"}}, {description: {$regex: search, $options: "i"}}]
		const expenses = await Expense.find(filter).sort({date: -1})
		res.json(expenses)
	} catch (err) {
		res.status(500).json({message: "Server error", error: err.message})
	}
}

export const updateExpense = async (req, res) => {
	try {
		const {id} = req.params
		const expense = await Expense.findOneAndUpdate({_id: id, user: req.user.id}, req.body, {new: true})
		if (!expense) return res.status(404).json({message: "Expense not found"})
		res.json(expense)
	} catch (err) {
		res.status(500).json({message: "Server error", error: err.message})
	}
}

export const deleteExpense = async (req, res) => {
	try {
		const {id} = req.params
		const expense = await Expense.findOneAndDelete({_id: id, user: req.user.id})
		if (!expense) return res.status(404).json({message: "Expense not found"})
		res.json({message: "Expense deleted"})
	} catch (err) {
		res.status(500).json({message: "Server error", error: err.message})
	}
}
