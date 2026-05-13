import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import VoiceRecorder from '../components/VoiceRecorder';
import api from '../services/api';
import './Auth.css';

const Payment = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({ receiverAccountNumber: '', receiverIfscCode: '', amount: '', description: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleDetailsSubmit = (e) => {
        e.preventDefault();
        if (formData.amount <= 0) {
            toast.error("Amount must be greater than zero");
            return;
        }
        setStep(2);
    };

    const handlePaymentConfirm = async (voiceBlob) => {
        setLoading(true);
        const data = new FormData();
        data.append('receiverAccountNumber', formData.receiverAccountNumber);
        data.append('receiverIfscCode', formData.receiverIfscCode);
        data.append('amount', formData.amount);
        data.append('description', formData.description);
        data.append('voiceData', voiceBlob, 'voice.webm');

        try {
            await api.post('/transactions/pay', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Payment completed successfully!');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Payment failed! Voice mismatch or insufficient funds.');
            setStep(1); // Go back if failed
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container animate-fade-in">
            <div className="card auth-card">
                <div className="auth-header">
                    <h2>Send Payment</h2>
                    <p>{step === 1 ? 'Enter payment details' : 'Authorize payment with your voice'}</p>
                </div>

                <div className="login-steps">
                    {step === 1 ? (
                        <form onSubmit={handleDetailsSubmit} className="step">
                            <div className="input-group">
                                <label className="input-label">Recipient Account Number</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="Enter Receiver's Account Number"
                                    value={formData.receiverAccountNumber}
                                    onChange={e => setFormData({ ...formData, receiverAccountNumber: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <label className="input-label">Recipient IFSC Code</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="Enter IFSC Code"
                                    value={formData.receiverIfscCode}
                                    onChange={e => setFormData({ ...formData, receiverIfscCode: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <label className="input-label">Amount (₹)</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0.01"
                                    value={formData.amount}
                                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <label className="input-label">Description (optional)</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="Dinner share"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <button type="submit" className="btn btn-primary w-full mt-4">
                                Proceed to Authorization
                            </button>
                        </form>
                    ) : (
                        <div className="step animate-fade-in">
                            <div className="transaction-summary" style={{ textAlign: 'center', marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-md)' }}>
                                <p>Sending <strong>₹{parseFloat(formData.amount).toFixed(2)}</strong> to</p>
                                <p>A/C: <strong>{formData.receiverAccountNumber}</strong></p>
                            </div>

                            <p className="voice-instruction">
                                Read the phrase to confirm payment:
                                <br />
                                <em>"I authorize this payment of ₹{parseFloat(formData.amount).toFixed(2)}."</em>
                            </p>
                            <VoiceRecorder
                                onRecordingComplete={handlePaymentConfirm}
                                actionText="Record Authorization Phrase"
                            />
                            <button
                                type="button"
                                className="btn btn-secondary w-full mt-4"
                                onClick={() => setStep(1)}
                                disabled={loading}
                            >
                                Cancel / Edit Details
                            </button>
                            {loading && <div style={{ textAlign: 'center', marginTop: '1rem' }}><span className="spinner" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }}></span> Processing Payment...</div>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Payment;
