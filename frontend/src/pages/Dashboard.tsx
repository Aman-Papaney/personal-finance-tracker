import { useEffect, useState } from "react";
import { Box, Typography, Divider, Avatar, Stack, Paper, Grid, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import { fetchApi, fetchSuggestions } from "../services/api";
import { Expense } from "../types";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A020F0", "#FF6384"];

const Dashboard = () => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [suggestions, setSuggestions] = useState<string[]>([]);

    useEffect(() => {
        fetchApi("/expenses").then(res => {
            setExpenses(res);
            setLoading(false);
            // Fetch suggestions from Flask after expenses are loaded
            fetchSuggestions(res).then(data => {
                setSuggestions(data.suggestions || []);
            }).catch(() => setSuggestions(["Could not fetch suggestions."]));
        });
    }, []);

    if (loading) return <Typography>Loading...</Typography>;

    // Get all unique months/years from expenses
    const monthYearSet = new Set<string>();
    expenses.forEach(e => {
        const d = new Date(e.date);
        monthYearSet.add(`${d.getFullYear()}-${d.getMonth()}`);
    });
    const monthYearOptions = Array.from(monthYearSet).map(str => {
        const [year, month] = str.split("-").map(Number);
        return { year, month };
    }).sort((a, b) => b.year !== a.year ? b.year - a.year : b.month - a.month);

    // Calculate total spend for selected month
    const monthExpenses = expenses.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });
    const totalSpend = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Most spent category
    const categoryTotals: { [cat: string]: number } = {};
    monthExpenses.forEach(e => {
        categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });
    const mostSpentCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";

    // Top 3 payment methods
    const paymentTotals: { [pm: string]: number } = {};
    monthExpenses.forEach(e => {
        paymentTotals[e.paymentMethod] = (paymentTotals[e.paymentMethod] || 0) + e.amount;
    });
    const topPaymentMethods = Object.entries(paymentTotals).sort((a, b) => b[1] - a[1]).slice(0, 3);

    // Pie chart data
    const pieData = Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));

    // Line chart data (spending trend by day, over last 6 months)
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const trendMap: { [date: string]: number } = {};
    expenses.forEach(e => {
        const d = new Date(e.date);
        if (d >= sixMonthsAgo && d <= now) {
            const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            trendMap[month] = (trendMap[month] || 0) + e.amount;
        }
    });
    const lineData = Object.entries(trendMap)
        .map(([month, value]) => ({ month, value }))
        .sort((a, b) => a.month.localeCompare(b.month));

    return (
        <Box p={3} sx={{ minHeight: '90vh', background: '#f5f6fa' }}>
            <Box display="flex" alignItems="center" mb={2} gap={2}>
                <Typography variant="h4" fontWeight={700} color="primary.main" flex={1}>
                    Welcome Back!
                </Typography>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Month</InputLabel>
                    <Select
                        value={`${selectedYear}-${selectedMonth}`}
                        label="Month"
                        onChange={e => {
                            const [year, month] = e.target.value.split("-").map(Number);
                            setSelectedYear(year);
                            setSelectedMonth(month);
                        }}
                    >
                        {monthYearOptions.map(opt => (
                            <MenuItem key={`${opt.year}-${opt.month}`} value={`${opt.year}-${opt.month}`}>
                                {new Date(opt.year, opt.month).toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>
            <Grid container spacing={3}>
                <Grid sx={{ xs: 12, md: 4 }} >
                    <Paper elevation={3} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                        <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                            <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>₹</Avatar>
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">Total Spend This Month</Typography>
                                <Typography variant="h4" color="primary.main">₹{totalSpend.toFixed(2)}</Typography>
                            </Box>
                        </Stack>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle2" color="text.secondary">Most Spent Category</Typography>
                        <Typography variant="h6" color="secondary.main">{mostSpentCategory}</Typography>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle2" color="text.secondary">Top Payment Methods</Typography>
                        {topPaymentMethods.map(([pm, amt]) => (
                            <Typography key={pm} color="text.primary">{pm}: ₹{amt.toFixed(2)}</Typography>
                        ))}
                    </Paper>
                </Grid>
                <Grid sx={{ xs: 12, md: 4 }} >
                    <Paper elevation={3} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                        <Typography variant="h6" mb={2} color="primary.main">Category-wise Spend</Typography>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                    {pieData.map((entry, idx) => (
                                        <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
                <Grid sx={{ xs: 12, md: 4 }} >
                    <Paper elevation={3} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                        <Typography variant="h6" mb={2} color="primary.main">Spending Trend (Last 6 Months)</Typography>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={lineData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" tickFormatter={m => {
                                    const [y, mo] = m.split('-');
                                    return new Date(Number(y), Number(mo) - 1).toLocaleString('default', { month: 'short', year: '2-digit' });
                                }} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
                <Grid sx={{ xs: 12, md: 6 }} >
                    <Paper elevation={2} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                        <Typography variant="h6" mb={2} color="primary.main">Recent Expenses</Typography>
                        <Box>
                            {monthExpenses.slice(0, 10).map((e, idx) => (
                                <Paper key={e._id} sx={{ mb: 1, p: 2, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: 1, bgcolor: idx % 2 === 0 ? 'grey.50' : 'grey.100' }}>
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', width: 36, height: 36, fontWeight: 700 }}>
                                            {e.category[0]}
                                        </Avatar>
                                        <Box>
                                            <Typography fontWeight={600}>{e.category}</Typography>
                                            <Typography variant="body2" color="text.secondary">{new Date(e.date).toLocaleDateString()}</Typography>
                                            {e.description && <Typography variant="caption" color="text.secondary">{e.description}</Typography>}
                                        </Box>
                                    </Box>
                                    <Typography variant="h6" color="secondary.main">₹{e.amount.toFixed(2)}</Typography>
                                </Paper>
                            ))}
                            {monthExpenses.length === 0 && <Typography color="text.secondary">No expenses this month.</Typography>}
                        </Box>
                    </Paper>
                </Grid>
                <Grid sx={{ xs: 12, md: 6 }} >
                    <Paper elevation={2} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                        <Typography variant="h6" mb={2} color="primary.main">Summary</Typography>
                        <Typography color="text.secondary">Total Transactions: <b>{monthExpenses.length}</b></Typography>
                        <Typography color="text.secondary">Average Spend: <b>₹{monthExpenses.length ? (totalSpend / monthExpenses.length).toFixed(2) : 0}</b></Typography>
                        <Typography color="text.secondary">Categories Used: <b>{Object.keys(categoryTotals).length}</b></Typography>
                        <Typography color="text.secondary">Payment Methods Used: <b>{Object.keys(paymentTotals).length}</b></Typography>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle2" color="primary.main">Suggestions</Typography>
                        {suggestions.map((s, i) => (
                            <Typography key={i} color="secondary.main">• {s}</Typography>
                        ))}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;
