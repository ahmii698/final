import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://127.0.0.1:8000/api';

function AdminForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${API_URL}/admin/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage('OTP sent to your email!');
        setStep(2);
      } else {
        // Detailed error messages based on status code
        if (response.status === 404) {
          setError('❌ Admin email not found! Please check your email address.');
        } else if (response.status === 500) {
          setError('❌ Server error: Unable to send OTP. Check your mail configuration or database connection.');
        } else if (data.message === 'Email not found') {
          setError('❌ This email is not registered as an admin!');
        } else if (data.message === 'Failed to send OTP email') {
          setError('❌ OTP generation failed! Please check if mail server is configured correctly or if database has otp/otp_expires_at columns.');
        } else {
          setError(data.message || '❌ Unknown error occurred. Please try again.');
        }
      }
    } catch (err) {
      setError('❌ Network error: Cannot connect to backend server. Make sure Laravel is running on http://127.0.0.1:8000');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('❌ Passwords do not match!');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('❌ Password must be at least 6 characters long!');
      setLoading(false);
      return;
    }

    if (!otp || otp.length !== 6) {
      setError('❌ Please enter a valid 6-digit OTP!');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/admin/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, new_password: newPassword }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage('✅ Password changed successfully! Redirecting to login...');
        setTimeout(() => navigate('/admin'), 2000);
      } else {
        // Detailed error messages
        if (response.status === 400) {
          setError('❌ Invalid OTP or OTP has expired! Please request a new OTP.');
        } else if (response.status === 404) {
          setError('❌ Admin email not found or OTP not requested!');
        } else if (data.message === 'Invalid OTP') {
          setError('❌ Wrong OTP entered! Please check your email for the correct 6-digit code.');
        } else if (data.message === 'OTP expired') {
          setError('❌ OTP has expired! Please click "Send OTP" again to get a new code.');
        } else if (data.message === 'No OTP request found') {
          setError('❌ No OTP request found! Please request a new OTP first.');
        } else {
          setError(data.message || '❌ Failed to reset password. Please try again.');
        }
      }
    } catch (err) {
      setError('❌ Network error: Cannot connect to server. Check if backend is running.');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-white/10 p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Forgot Password</h1>
          <div className="w-20 h-px bg-white/20 mx-auto" />
        </div>

        {message && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 text-sm text-center">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleSendOTP} className="space-y-5">
            <input
              type="email"
              placeholder="Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/20 rounded-xl px-5 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/50"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-white text-black rounded-xl font-semibold hover:bg-gray-200 transition-all hover:scale-105 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div>
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full bg-white/5 border border-white/20 rounded-xl px-5 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/50"
                required
              />
              <p className="text-white/30 text-xs mt-1">Enter the 6-digit code sent to your email</p>
            </div>
            <input
              type="password"
              placeholder="New Password (min 6 characters)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/20 rounded-xl px-5 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/50"
              required
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/20 rounded-xl px-5 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/50"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-white text-black rounded-xl font-semibold hover:bg-gray-200 transition-all hover:scale-105 disabled:opacity-50"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setError('');
                setMessage('');
              }}
              className="w-full py-2 bg-transparent border border-white/20 text-white/60 rounded-xl font-semibold hover:bg-white/5 transition-all text-sm"
            >
              ← Back to Request New OTP
            </button>
          </form>
        )}

        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/admin')}
            className="text-white/40 hover:text-white text-sm transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminForgotPassword;