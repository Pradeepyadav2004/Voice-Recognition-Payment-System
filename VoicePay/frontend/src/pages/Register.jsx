import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import VoiceRecorder from '../components/VoiceRecorder';
import api from '../services/api';
import './Auth.css';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [voiceBlob, setVoiceBlob] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!voiceBlob) {
            toast.error('Please record your voice for biometric registration');
            return;
        }

        const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(formData.password)) {
            toast.error('Password must be strong: at least 8 characters, 1 uppercase letter, and 1 number.');
            return;
        }

        setLoading(true);
        const data = new FormData();
        data.append('name', formData.name);
        data.append('email', formData.email);
        data.append('password', formData.password);
        data.append('voiceData', voiceBlob, 'voice.webm');

        try {
            await api.post('/auth/register', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Registration successful! Please login.');
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container animate-fade-in">
            <div className="card auth-card">
                <div className="auth-header">
                    <h2>Create an Account</h2>
                    <p>Register with your voice for enhanced security</p>
                </div>

                <form onSubmit={handleRegister}>
                    <div className="input-group">
                        <label className="input-label">Full Name</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

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

                    <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                        <label className="input-label">Password</label>
                        <input
                            type="password"
                            className="input-field"
                            placeholder="Create a strong password"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                        <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block', marginTop: '0.4rem', lineHeight: '1.4' }}>
                            Create a strong, unique password. <strong style={{ color: 'var(--danger)' }}>Do not use your real Gmail password!</strong><br />
                            This new app password will be securely encrypted and saved in our VoicePay database.
                        </small>
                    </div>

                    <div className="voice-section">
                        <p className="voice-instruction">
                            <strong>Voice Setup:</strong> Read the following phrase clearly:
                            <br />
                            <em>"My voice is my password, verify me."</em>
                        </p>
                        <VoiceRecorder onRecordingComplete={setVoiceBlob} actionText="Record Registration Phrase" />
                    </div>

                    <button type="submit" className="btn btn-primary w-full mt-4" disabled={loading}>
                        {loading ? <span className="spinner"></span> : 'Complete Registration'}
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an account? <Link to="/login" className="auth-link">Login here</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
