import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wallet, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [profileRes, txRes] = await Promise.all([
                    api.get('/users/profile'),
                    api.get('/transactions/recent')
                ]);

                if (!profileRes.data.bankDetails) {
                    navigate('/bank-details');
                    return;
                }

                setBalance(profileRes.data.balance);
                setTransactions(txRes.data);
            } catch (err) {
                console.error("Failed to load dashboard data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) {
        return <div className="loading-container"><span className="spinner" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent', width: '3rem', height: '3rem', borderWidth: '4px' }}></span></div>;
    }

    return (
        <div className="dashboard-container animate-fade-in">
            <div className="dashboard-header">
                <h1>Welcome back, {user?.name}</h1>
                <p>Here is your financial overview.</p>
            </div>

            <div className="dashboard-grid">
                <div className="card balance-card">
                    <div className="balance-header">
                        <h3>Total Balance</h3>
                        <Wallet size={24} className="balance-icon" />
                    </div>
                    <h2 className="balance-amount">₹{balance.toFixed(2)}</h2>
                    <div className="balance-actions">
                        <Link to="/payment" className="btn btn-primary w-full">Make a Payment</Link>
                    </div>
                </div>

                <div className="card overview-card">
                    <h3>Quick Stats</h3>
                    <div className="stats-list">
                        <div className="stat-item">
                            <div className="stat-icon income"><ArrowDownRight size={20} /></div>
                            <div className="stat-info">
                                <span className="stat-label">Income (Monthly)</span>
                                <span className="stat-value">₹1,240.00</span>
                            </div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-icon expense"><ArrowUpRight size={20} /></div>
                            <div className="stat-info">
                                <span className="stat-label">Expenses (Monthly)</span>
                                <span className="stat-value">₹420.50</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="recent-transactions">
                <div className="section-header">
                    <h3>Recent Transactions</h3>
                    <Link to="/history" className="view-all-link">View All</Link>
                </div>

                <div className="transaction-list card">
                    {transactions.length === 0 ? (
                        <div className="empty-state">
                            <Activity size={48} />
                            <p>No recent transactions</p>
                        </div>
                    ) : (
                        transactions.map(tx => (
                            <div key={tx.id} className="transaction-item">
                                <div className="tx-details">
                                    <div className={`tx-icon ${tx.senderId === user.id ? 'sent' : 'received'}`}>
                                        {tx.senderId === user.id ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                                    </div>
                                    <div>
                                        <h4 className="tx-title">
                                            {tx.senderId === user.id ? `Sent to ${tx.receiverName}` : `Received from ${tx.senderName}`}
                                        </h4>
                                        <span className="tx-date">{new Date(tx.timestamp).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className={`tx-amount ${tx.senderId === user.id ? 'negative' : 'positive'}`}>
                                    {tx.senderId === user.id ? '-' : '+'}₹{tx.amount.toFixed(2)}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
