import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Lock, Mail } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token, email: userEmail } = response.data;
            login(token, userEmail);
            navigate('/courses');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', flexDirection: 'column' }}>

            <div className="glass-panel" style={{ padding: '3rem', width: '100%', maxWidth: '400px', borderRadius: 'var(--radius-lg)' }}>
                <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '2rem', background: 'linear-gradient(to right, #fff, #a0a0b0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Welcome Back
                </h2>

                {error && <div className="btn-danger" style={{ marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ position: 'relative' }}>
                        <Mail size={18} color="var(--text-tertiary)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                        <input
                            className="input-field"
                            style={{ paddingLeft: '2.5rem' }}
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Lock size={18} color="var(--text-tertiary)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                        <input
                            className="input-field"
                            style={{ paddingLeft: '2.5rem' }}
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>
                        Sign In
                    </button>
                </form>
            </div>

            <div style={{ marginTop: '2rem', color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
                Demo: admin@test.com / Admin123!
            </div>
        </div>
    );
}
