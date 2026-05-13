import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import './Auth.css';
import { useAuth } from '../context/AuthContext';

const BankDetails = () => {
    const [formData, setFormData] = useState({
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        accountHolderName: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { fetchUser } = useAuth(); // Assuming there's a fetchUser method to refresh state

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/users/bank-details', formData);
            toast.success('Bank details saved successfully!');

            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save bank details.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container animate-fade-in">
            <div className="card auth-card">
                <div className="auth-header">
                    <h2>Bank Details</h2>
                    <p>Please enter your bank info to continue using VoicePay.</p>
                </div>

                <form onSubmit={handleSubmit} className="step">
                    <div className="input-group">
                        <label className="input-label">Bank Name</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="e.g. State Bank of India"
                            value={formData.bankName}
                            onChange={e => setFormData({ ...formData, bankName: e.target.value })}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Account Holder Name</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Full Name"
                            value={formData.accountHolderName}
                            onChange={e => setFormData({ ...formData, accountHolderName: e.target.value })}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Account Number</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Enter Account Number"
                            value={formData.accountNumber}
                            onChange={e => setFormData({ ...formData, accountNumber: e.target.value })}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">IFSC Code</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="e.g. SBIN0001234"
                            value={formData.ifscCode}
                            onChange={e => setFormData({ ...formData, ifscCode: e.target.value })}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary w-full mt-4" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Details'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default BankDetails;
