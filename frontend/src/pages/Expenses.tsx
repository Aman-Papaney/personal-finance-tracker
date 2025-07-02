import { useEffect, useState } from "react";
import {
    Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, InputLabel, FormControl, Typography, Alert, Stack, Card, CardContent
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { fetchApi } from "../services/api";
import type { Expense } from "../types";
import ExpenseRow from "../components/ExpenseRow";
import AddIcon from "@mui/icons-material/Add";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CategoryIcon from "@mui/icons-material/Category";
import PaymentsIcon from "@mui/icons-material/Payments";

const paymentMethods = ["Cash", "Credit Card", "Debit Card", "UPI", "Net Banking"];
const categories = ["Food", "Transport", "Shopping", "Bills", "Other"];

const Expenses = () => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [open, setOpen] = useState(false);
    const [editExpense, setEditExpense] = useState<Expense | null>(null);
    const [form, setForm] = useState({ amount: "", category: "", date: "", paymentMethod: "", description: "" });
    const [filters, setFilters] = useState({ category: "", paymentMethod: "", startDate: "", endDate: "", search: "" });
    const [error, setError] = useState("");

    const fetchExpenses = async () => {
        try {
            const params = new URLSearchParams(filters as any).toString();
            const res = await fetchApi(`/expenses${params ? `?${params}` : ""}`);
            setExpenses(res);
        } catch (err: any) {
            setError("Failed to fetch expenses");
        }
    };

    useEffect(() => { fetchExpenses(); }, [filters]);

    const handleOpen = (expense?: Expense) => {
        setEditExpense(expense || null);
        setForm(expense ? { ...expense, amount: String(expense.amount) } : { amount: "", category: "", date: "", paymentMethod: "", description: "" });
        setOpen(true);
    };
    const handleClose = () => { setOpen(false); setEditExpense(null); };

    const handleChange = (e: any) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        try {
            if (editExpense) {
                await fetchApi(`/expenses/${editExpense._id}`, {
                    method: "PUT",
                    body: JSON.stringify({ ...form, amount: Number(form.amount) })
                });
            } else {
                await fetchApi("/expenses", {
                    method: "POST",
                    body: JSON.stringify({ ...form, amount: Number(form.amount) })
                });
            }
            fetchExpenses();
            handleClose();
        } catch (err: any) {
            setError("Failed to save expense");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await fetchApi(`/expenses/${id}`, { method: "DELETE" });
            fetchExpenses();
        } catch {
            setError("Failed to delete expense");
        }
    };

    // Analytics for summary cards (should use all expenses, not filtered)
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const mostSpentCategory = Object.entries(
        expenses.reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + e.amount; return acc; }, {} as Record<string, number>)
    ).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";
    const topPayment = Object.entries(
        expenses.reduce((acc, e) => { acc[e.paymentMethod] = (acc[e.paymentMethod] || 0) + e.amount; return acc; }, {} as Record<string, number>)
    ).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";

    // Filtered expenses for table only
    const filteredExpenses = expenses.filter(e => {
        const matchCategory = !filters.category || e.category === filters.category;
        const matchPayment = !filters.paymentMethod || e.paymentMethod === filters.paymentMethod;
        const matchStart = !filters.startDate || e.date >= filters.startDate;
        const matchEnd = !filters.endDate || e.date <= filters.endDate;
        const matchSearch = !filters.search ||
            e.category.toLowerCase().includes(filters.search.toLowerCase()) ||
            e.paymentMethod.toLowerCase().includes(filters.search.toLowerCase()) ||
            (e.description && e.description.toLowerCase().includes(filters.search.toLowerCase()));
        return matchCategory && matchPayment && matchStart && matchEnd && matchSearch;
    });

    return (
        <Box p={3} sx={{ minHeight: '90vh', background: '#f5f6fa' }}>
            <Grid container spacing={3} mb={2}>
                <Grid sx={{ xs: 12, md: 6 }} >
                    <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText', borderRadius: 3 }}>
                        <CardContent>
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <TrendingUpIcon fontSize="large" />
                                <Box>
                                    <Typography variant="subtitle2">Total Expenses</Typography>
                                    <Typography variant="h5">₹{total.toFixed(2)}</Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid sx={{ xs: 12, md: 6 }} >
                    <Card sx={{ bgcolor: 'secondary.light', color: 'secondary.contrastText', borderRadius: 3 }}>
                        <CardContent>
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <CategoryIcon fontSize="large" />
                                <Box>
                                    <Typography variant="subtitle2">Most Spent Category</Typography>
                                    <Typography variant="h5">{mostSpentCategory}</Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid sx={{ xs: 12, md: 6 }} >
                    <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText', borderRadius: 3 }}>
                        <CardContent>
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <PaymentsIcon fontSize="large" />
                                <Box>
                                    <Typography variant="subtitle2">Top Payment Method</Typography>
                                    <Typography variant="h5">{topPayment}</Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3, mb: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={2}>
                    <Typography variant="h5">Expenses</Typography>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()} sx={{ minWidth: 120 }}>
                        Add Expense
                    </Button>
                </Box>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <Box mb={2} display="flex" gap={2} flexWrap="wrap">
                    <TextField size="small" label="Search" value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} />
                </Box>
                <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 0 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell>Payment</TableCell>
                                <TableCell>Amount</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredExpenses.map(exp => (
                                <ExpenseRow key={exp._id} expense={exp} onEdit={handleOpen} onDelete={handleDelete} />
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
            <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
                <DialogTitle>{editExpense ? "Edit Expense" : "Add Expense"}</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 300 }}>
                    <TextField label="Amount" name="amount" type="number" value={form.amount} onChange={handleChange} required fullWidth />
                    <FormControl fullWidth>
                        <InputLabel>Category</InputLabel>
                        <Select name="category" value={form.category} label="Category" onChange={handleChange} required>
                            {categories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <TextField label="Date" name="date" type="date" InputLabelProps={{ shrink: true }} value={form.date} onChange={handleChange} required fullWidth />
                    <FormControl fullWidth>
                        <InputLabel>Payment Method</InputLabel>
                        <Select name="paymentMethod" value={form.paymentMethod} label="Payment Method" onChange={handleChange} required>
                            {paymentMethods.map(pm => <MenuItem key={pm} value={pm}>{pm}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <TextField label="Description" name="description" value={form.description} onChange={handleChange} fullWidth />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Expenses;
