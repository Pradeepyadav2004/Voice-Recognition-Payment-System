import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import VoiceRecorder from '../components/VoiceRecorder';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
    const [step, setStep] = useState(1); // 1: Credentials, 2: Voice
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [tempUserId, setTempUserId] = useState(null); // to link voice verification

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleCredentialsSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/auth/login-step1', formData);
            setTempUserId(res.data.userId);
            setStep(2);
            toast.info('Credentials verified. Please verify your voice.');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    const handleVoiceVerification = async (voiceBlob) => {
        setLoading(true);
        const data = new FormData();
        data.append('userId', tempUserId);
        data.append('voiceData', voiceBlob, 'voice.webm');

        try {
            const res = await api.post('/auth/verify-voice', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Login successful!');
            login(res.data.token);
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Voice verification failed. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container animate-fade-in">
            <div className="card auth-card">
                <div className="auth-header">
                    <h2>Welcome Back</h2>
                    <p>{step === 1 ? 'Enter your credentials' : 'Verify your identity with voice'}</p>
                </div>

                <div className="login-steps">
                    {step === 1 ? (
                        <form onSubmit={handleCredentialsSubmit} className="step">
                            <div className="input-group">
                                <label className="input-label">Email</label>
                                <input
                                    type="email"
                                    className="input-field"
                                    placeholder="john@example.com"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <label className="input-label">Password</label>
                                <input
                                    type="password"
                                    className="input-field"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            </div>

                            <button type="submit" className="btn btn-primary w-full mt-4" disabled={loading}>
                                {loading ? <span className="spinner"></span> : 'Continue'}
                            </button>
                        </form>
                    ) : (
                        <div className="step animate-fade-in">
                            <p className="voice-instruction">
                                Read the phrase to confirm your identity:
                                <br />
                                <em>"I am verifying my login to VoicePay."</em>
                            </p>
                            <VoiceRecorder
                                onRecordingComplete={handleVoiceVerification}
                                actionText="Record Verification Phrase"
                            />
                            <button
                                type="button"
                                className="btn btn-secondary w-full mt-4"
                                onClick={() => setStep(1)}
                                disabled={loading}
                            >
                                Back to credentials
                            </button>
                            {loading && <div style={{ textAlign: 'center', marginTop: '1rem' }}><span className="spinner" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }}></span> Verifying...</div>}
                        </div>
                    )}
                </div>

                {step === 1 && (
                    <p className="auth-footer">
                        Don't have an account? <Link to="/register" className="auth-link">Register here</Link>
                    </p>
                )}
            </div>
        </div>
    );
};

export default Login;
