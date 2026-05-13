import React, { useEffect, useState } from 'react';
import api from '../services/api';

const Admin = () => {
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({ totalUsers: 0, totalTx: 0, systemBalance: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const res = await api.get('/admin/users');
                setUsers(res.data);
                // Stats would likely come from an endpoint, mocked here for layout
                setStats({
                    totalUsers: res.data.length,
                    totalTx: 1450,
                    systemBalance: 524000
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAdminData();
    }, []);

    return (
        <div className="dashboard-container animate-fade-in">
            <div className="dashboard-header">
                <h1>Admin Console</h1>
                <p>System overview and user management.</p>
            </div>

            <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div className="card">
                    <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Users</h3>
                    <h2 style={{ fontSize: '2rem' }}>{stats.totalUsers}</h2>
                </div>
                <div className="card">
                    <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Transactions</h3>
                    <h2 style={{ fontSize: '2rem' }}>{stats.totalTx}</h2>
                </div>
                <div className="card">
                    <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>System Economy</h3>
                    <h2 style={{ fontSize: '2rem' }}>₹{stats.systemBalance.toLocaleString()}</h2>
                </div>
            </div>

            <div className="card">
                <h3>User Management</h3>
                <div style={{ overflowX: 'auto', marginTop: '1.5rem' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                                <th style={{ padding: '0.75rem 0' }}>ID</th>
                                <th style={{ padding: '0.75rem 0' }}>Name</th>
                                <th style={{ padding: '0.75rem 0' }}>Email</th>
                                <th style={{ padding: '0.75rem 0' }}>Role</th>
                                <th style={{ padding: '0.75rem 0' }}>Balance</th>
                                <th style={{ padding: '0.75rem 0' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>Loading...</td></tr>
                            ) : (
                                users.map(u => (
                                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '1rem 0' }}>{u.id}</td>
                                        <td style={{ padding: '1rem 0', fontWeight: '500' }}>{u.name}</td>
                                        <td style={{ padding: '1rem 0' }}>{u.email}</td>
                                        <td style={{ padding: '1rem 0' }}>
                                            <span style={{ padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-md)', fontSize: '0.75rem', backgroundColor: u.role === 'ADMIN' ? 'rgba(79, 70, 229, 0.1)' : 'var(--bg-color)', color: u.role === 'ADMIN' ? 'var(--primary)' : 'inherit' }}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem 0' }}>₹{u.balance?.toFixed(2) || '0.00'}</td>
                                        <td style={{ padding: '1rem 0' }}>
                                            <span style={{ color: 'var(--success)', fontSize: '0.85rem' }}>Active</span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Admin;
