import { useEffect, useState } from "react";
import {
    Box, Card, CardContent, Typography, TextField, Button, Alert, MenuItem, Select, InputLabel, FormControl, Stack, Avatar, LinearProgress, Paper
} from "@mui/material";
import Grid from "@mui/material/Grid";
import SavingsIcon from "@mui/icons-material/Savings";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { fetchApi } from "../services/api";
import { Budget, Expense } from "../types";

const categories = ["Food", "Transport", "Shopping", "Bills", "Other"];

const Budgets = () => {
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [form, setForm] = useState({ category: "", monthlyLimit: "" });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const fetchBudgets = async () => {
        try {
            const res = await fetchApi("/budgets");
            setBudgets(res);
        } catch {
            setError("Failed to fetch budgets");
        }
    };
    const fetchExpenses = async () => {
        try {
            const res = await fetchApi("/expenses");
            setExpenses(res);
        } catch { }
    };

    useEffect(() => { fetchBudgets(); fetchExpenses(); }, []);

    const handleChange = (e: any) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        try {
            await fetchApi("/budgets", {
                method: "POST",
                body: JSON.stringify({ ...form, monthlyLimit: Number(form.monthlyLimit) })
            });
            setSuccess("Budget set/updated!");
            setForm({ category: "", monthlyLimit: "" });
            fetchBudgets();
            setTimeout(() => setSuccess(""), 1500);
        } catch {
            setError("Failed to set budget");
        }
    };

    // Calculate spend per category this month
    const now = new Date();
    const monthExpenses = expenses.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const spendByCategory: { [cat: string]: number } = {};
    monthExpenses.forEach(e => {
        spendByCategory[e.category] = (spendByCategory[e.category] || 0) + e.amount;
    });

    // Total budget and spend for summary
    const totalBudget = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
    const totalSpent = Object.values(spendByCategory).reduce((sum, v) => sum + v, 0);
    const percentUsed = totalBudget ? (totalSpent / totalBudget) * 100 : 0;

    return (
        <Box p={3} sx={{ minHeight: '90vh', background: '#f5f6fa' }}>
            <Grid container spacing={3} mb={3}>
                <Grid sx={{ xs: 12, md: 6 }} >
                    <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText', borderRadius: 3 }}>
                        <CardContent>
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <SavingsIcon fontSize="large" />
                                <Box>
                                    <Typography variant="subtitle2">Total Budget</Typography>
                                    <Typography variant="h5">₹{totalBudget.toFixed(2)}</Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid sx={{ xs: 12, md: 6 }} >
                    <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText', borderRadius: 3 }}>
                        <CardContent>
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <TrendingUpIcon fontSize="large" />
                                <Box>
                                    <Typography variant="subtitle2">Total Spent</Typography>
                                    <Typography variant="h5">₹{totalSpent.toFixed(2)}</Typography>
                                </Box>
                            </Stack>
                            <Box mt={2}>
                                <LinearProgress variant="determinate" value={percentUsed} sx={{ height: 10, borderRadius: 5, bgcolor: 'grey.200' }} />
                                <Typography variant="body2" mt={1}>{percentUsed.toFixed(1)}% of total budget used</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3, mb: 3 }}>
                <Typography variant="h6" mb={2} color="primary.main">Set or Update Budget</Typography>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
                <Box mb={2} display="flex" gap={2} flexWrap="wrap">
                    <FormControl sx={{ minWidth: 160 }}>
                        <InputLabel>Category</InputLabel>
                        <Select name="category" value={form.category} label="Category" onChange={handleChange} required>
                            {categories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <TextField label="Monthly Limit" name="monthlyLimit" type="number" value={form.monthlyLimit} onChange={handleChange} required sx={{ minWidth: 160 }} />
                    <Button variant="contained" onClick={handleSubmit} sx={{ minWidth: 120 }}>Set/Update</Button>
                </Box>
            </Paper>
            <Grid container spacing={3}>
                {budgets.map(budget => {
                    const spent = spendByCategory[budget.category] || 0;
                    const percent = (spent / budget.monthlyLimit) * 100;
                    return (
                        <Grid sx={{ xs: 12, md: 6 }} key={budget.category}>
                            <Card sx={{ borderRadius: 3, boxShadow: 3, position: 'relative', overflow: 'visible' }}>
                                <CardContent>
                                    <Stack direction="row" alignItems="center" spacing={2} mb={1}>
                                        <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', width: 40, height: 40, fontWeight: 700 }}>
                                            {budget.category[0]}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="h6">{budget.category}</Typography>
                                            <Typography variant="body2" color="text.secondary">Limit: ₹{budget.monthlyLimit}</Typography>
                                        </Box>
                                    </Stack>
                                    <Box mt={1}>
                                        <LinearProgress variant="determinate" value={percent} sx={{ height: 8, borderRadius: 5, bgcolor: 'grey.200' }} />
                                        <Typography variant="body2" mt={1}>Spent: ₹{spent.toFixed(2)} ({percent.toFixed(1)}%)</Typography>
                                    </Box>
                                    {percent >= 100 && <Alert icon={<WarningAmberIcon />} severity="error" sx={{ mt: 2 }}>Budget exceeded!</Alert>}
                                    {percent >= 80 && percent < 100 && <Alert icon={<WarningAmberIcon />} severity="warning" sx={{ mt: 2 }}>Over 80% used</Alert>}
                                </CardContent>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    );
};

export default Budgets;
