import express from "express"
import auth from "../middleware/auth.js"
import {addExpense, getExpenses, updateExpense, deleteExpense} from "../controllers/expenseController.js"

const router = express.Router()

router.use(auth)
router.post("/", addExpense)
router.get("/", getExpenses)
router.put("/:id", updateExpense)
router.delete("/:id", deleteExpense)

export default router
