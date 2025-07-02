import { TableRow, TableCell, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Expense } from "../types";

interface ExpenseRowProps {
    expense: Expense;
    onEdit: (expense: Expense) => void;
    onDelete: (id: string) => void;
}

const ExpenseRow = ({ expense, onEdit, onDelete }: ExpenseRowProps) => (
    <TableRow>
        <TableCell>{expense.date.slice(0, 10)}</TableCell>
        <TableCell>{expense.category}</TableCell>
        <TableCell>{expense.paymentMethod}</TableCell>
        <TableCell>{expense.amount}</TableCell>
        <TableCell>
            <IconButton onClick={() => onEdit(expense)}><EditIcon /></IconButton>
            <IconButton onClick={() => onDelete(expense._id)}><DeleteIcon /></IconButton>
        </TableCell>
    </TableRow>
);

export default ExpenseRow;
