import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    <Link to="/dashboard" style={{ color: '#fff', textDecoration: 'none' }}>
                        Finance Tracker
                    </Link>
                </Typography>
                {user && (
                    <Box>
                        <Button color="inherit" component={Link} to="/dashboard">Dashboard</Button>
                        <Button color="inherit" component={Link} to="/expenses">Expenses</Button>
                        <Button color="inherit" component={Link} to="/budgets">Budgets</Button>
                        <Button color="inherit" onClick={handleLogout}>Logout</Button>
                    </Box>
                )}
                {!user && (
                    <Box>
                        <Button color="inherit" component={Link} to="/login">Login</Button>
                        <Button color="inherit" component={Link} to="/signup">Signup</Button>
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
