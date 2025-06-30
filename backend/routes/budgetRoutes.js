import express from "express"
import auth from "../middleware/auth.js"
import {setOrUpdateBudget, getBudgets} from "../controllers/budgetController.js"

const router = express.Router()

router.use(auth)
router.post("/", setOrUpdateBudget)
router.get("/", getBudgets)

export default router
