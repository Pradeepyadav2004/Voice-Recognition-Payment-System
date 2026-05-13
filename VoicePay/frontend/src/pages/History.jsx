import React, { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Search, Download } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const History = () => {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [downloadPeriod, setDownloadPeriod] = useState('1'); // Months

    const handleDownload = () => {
        const months = parseInt(downloadPeriod, 10);
        const cutoffDate = new Date();
        cutoffDate.setMonth(cutoffDate.getMonth() - months);

        const dataToDownload = transactions.filter(tx => new Date(tx.timestamp) >= cutoffDate);

        if (dataToDownload.length === 0) {
            alert('No transactions in this period to download.');
            return;
        }

        const headers = ['Date', 'Type', 'Party', 'Description', 'Amount', 'Status'];
        const csvRows = [headers.join(',')];

        dataToDownload.forEach(tx => {
            const isSender = tx.senderId === user.id;
            const date = new Date(tx.timestamp).toLocaleString();
            const type = isSender ? 'Sent' : 'Received';
            const party = isSender ? tx.receiverName : tx.senderName;
            const desc = tx.description || 'N/A';
            const amount = isSender ? `-${tx.amount.toFixed(2)}` : `+${tx.amount.toFixed(2)}`;
            const status = tx.status;

            // Escape quotes and commas for CSV
            const row = [date, type, party, desc, amount, status].map(cell => `"${String(cell).replace(/"/g, '""')}"`);
            csvRows.push(row.join(','));
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `VoicePay_History_${months}Months.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await api.get('/transactions/history');
                setTransactions(res.data);
            } catch (err) {
                console.error("Fetch history error", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const filteredData = transactions.filter(tx =>
        (tx.receiverName && tx.receiverName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (tx.senderName && tx.senderName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (tx.description && tx.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="dashboard-container animate-fade-in">
            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1>Transaction History</h1>
                    <p>Review all your past transactions.</p>
                </div>
                <div style={{ position: 'relative', width: '300px', maxWidth: '100%' }}>
                    <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        className="input-field"
                        placeholder="Search by name or description..."
                        style={{ paddingLeft: '2.5rem' }}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'flex-start' }}>
                <span style={{ fontWeight: '500' }}>Download Statement: </span>
                <select
                    className="input-field"
                    style={{ width: 'auto', padding: '0.5rem', minWidth: '150px' }}
                    value={downloadPeriod}
                    onChange={(e) => setDownloadPeriod(e.target.value)}
                >
                    <option value="1">Last 1 Month</option>
                    <option value="2">Last 2 Months</option>
                    <option value="3">Last 3 Months</option>
                </select>
                <button onClick={handleDownload} className="btn btn-primary" style={{ padding: '0.6rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Download size={18} /> Download CSV
                </button>
            </div>

            <div className="card" style={{ padding: 0 }}>
                {loading ? (
                    <div className="loading-container" style={{ minHeight: '300px' }}>
                        <span className="spinner" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent', width: '2rem', height: '2rem' }}></span>
                    </div>
                ) : (
                    <div className="transaction-list">
                        {filteredData.length === 0 ? (
                            <div className="empty-state" style={{ padding: '4rem 1rem' }}>
                                <p>No transactions found.</p>
                            </div>
                        ) : (
                            filteredData.map(tx => (
                                <div key={tx.id} className="transaction-item">
                                    <div className="tx-details">
                                        <div className={`tx-icon ${tx.senderId === user.id ? 'sent' : 'received'}`}>
                                            {tx.senderId === user.id ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                                        </div>
                                        <div>
                                            <h4 className="tx-title">
                                                {tx.senderId === user.id ? `Sent to ${tx.receiverName}` : `Received from ${tx.senderName}`}
                                            </h4>
                                            <span className="tx-date">
                                                {new Date(tx.timestamp).toLocaleString()} {tx.description ? `• ${tx.description}` : ''}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div className={`tx-amount ${tx.senderId === user.id ? 'negative' : 'positive'}`}>
                                            {tx.senderId === user.id ? '-' : '+'}₹{tx.amount.toFixed(2)}
                                        </div>
                                        <span style={{ fontSize: '0.75rem', color: tx.status === 'SUCCESS' ? 'var(--success)' : 'var(--danger)' }}>
                                            {tx.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default History;
