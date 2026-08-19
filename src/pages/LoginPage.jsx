import { useState } from 'react';
import { requestOtp, verifyOtp } from '../utils/api';

export default function LoginPage({ onLogin }) {
  const [step, setStep] = useState(1);
  const [contact, setContact] = useState('');
  const [code, setCode] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const phone = /^\d+$/.test(contact.trim()) ? contact.trim() : '';
      const email = phone ? '' : contact.trim();
      if (!phone && !email.includes('@')) throw new Error('Enter a phone number or email');
      const data = await requestOtp(phone, email);
      setSessionId(data.session_id);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await verifyOtp(sessionId, code.trim());
      if (data.role !== 'bursar' && data.role !== 'head') {
        throw new Error('Only a bursar or school head can use Bazar Pay');
      }
      const user = {
        teacher_id: data.teacher_id,
        school_id: data.school_id,
        role: data.role,
        email: contact.includes('@') ? contact.trim() : '',
        phone: /^\d+$/.test(contact.trim()) ? contact.trim() : '',
      };
      sessionStorage.setItem('token', data.session_id);
      sessionStorage.setItem('user', JSON.stringify(user));
      onLogin(user);
    } catch (err) {
      setError(err.message);
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Bazar Pay</h1>
        <p className="login-subtitle">School Fee Management</p>
        {step === 1 ? (
          <form onSubmit={handleRequest}>
            <input type="text" placeholder="Phone (254...) or email" value={contact} onChange={e => setContact(e.target.value)} required />
            {error && <p className="login-error">{error}</p>}
            <button type="submit" disabled={loading}>{loading ? 'Sending code…' : 'Send OTP'}</button>
          </form>
        ) : (
          <form onSubmit={handleVerify}>
            <input type="text" inputMode="numeric" placeholder="Enter OTP code" value={code} onChange={e => setCode(e.target.value)} required />
            {error && <p className="login-error">{error}</p>}
            <button type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign In'}</button>
            <button type="button" className="login-back" onClick={() => { setStep(1); setError(''); setCode(''); }}>
              ← Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
}