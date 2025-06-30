import mongoose from "mongoose"

const budgetSchema = new mongoose.Schema(
	{
		user: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
		category: {type: String, required: true},
		monthlyLimit: {type: Number, required: true},
	},
	{timestamps: true}
)

export default mongoose.model("Budget", budgetSchema)
