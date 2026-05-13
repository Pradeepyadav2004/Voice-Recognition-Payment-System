import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Moon, Sun, Mic, LogOut, LayoutDashboard, CreditCard, History } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ theme, toggleTheme }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar glass-morphism">
            <div className="navbar-container">
                <Link to="/" className="navbar-brand">
                    <Mic className="logo-icon" />
                    <span className="logo-text">VoicePay</span>
                </Link>

                <div className="navbar-links">
                    {user ? (
                        <>
                            <Link to="/dashboard" className="nav-link"><LayoutDashboard size={18} /> Dashboard</Link>
                            <Link to="/payment" className="nav-link"><CreditCard size={18} /> Pay</Link>
                            <Link to="/history" className="nav-link"><History size={18} /> History</Link>
                            {user.role === 'ADMIN' && <Link to="/admin" className="nav-link">Admin</Link>}

                            <button onClick={handleLogout} className="btn-logout nav-link">
                                <LogOut size={18} /> Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="nav-link">Login</Link>
                            <Link to="/register" className="nav-link btn btn-primary navbar-btn" style={{ color: 'white' }}>Register</Link>
                        </>
                    )}

                    <button onClick={toggleTheme} className="theme-toggle">
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
