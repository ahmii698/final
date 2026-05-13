import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    let result;
    if (isLogin) {
      result = await login(formData.email, formData.password);
    } else {
      if (formData.password !== formData.password_confirmation) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }
      result = await register(formData.name, formData.email, formData.password, formData.password_confirmation);
    }

    if (result.success) {
      // Redirect to previous page or home
      const redirectTo = localStorage.getItem('redirectAfterLogin') || '/';
      localStorage.removeItem('redirectAfterLogin');
      navigate(redirectTo);
    } else {
      setError(result.message || 'Something went wrong');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="/images/15.webp" alt="Auth Hero" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-wider text-white">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            {isLogin ? 'Login to your account' : 'Sign up to start shopping'}
          </p>
          <div className="w-24 h-px bg-white/20 mx-auto mt-6" />
        </div>
      </section>

      {/* Auth Form */}
      <section className="py-16 px-4 max-w-md mx-auto">
        <div className="bg-black rounded-xl border border-white/10 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-white/70 text-sm mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-5 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/50"
                  placeholder="Enter your name"
                />
              </div>
            )}
            
            <div>
              <label className="block text-white/70 text-sm mb-1">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full bg-white/5 border border-white/20 rounded-xl px-5 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/50"
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <label className="block text-white/70 text-sm mb-1">Password</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full bg-white/5 border border-white/20 rounded-xl px-5 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/50"
                placeholder="Enter your password"
              />
            </div>
            
            {!isLogin && (
              <div>
                <label className="block text-white/70 text-sm mb-1">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={formData.password_confirmation}
                  onChange={(e) => setFormData({...formData, password_confirmation: e.target.value})}
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-5 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/50"
                  placeholder="Confirm your password"
                />
              </div>
            )}
            
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-white text-black rounded-xl font-semibold hover:bg-gray-200 transition-all disabled:opacity-50"
            >
              {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setFormData({ name: '', email: '', password: '', password_confirmation: '' });
              }}
              className="text-white/50 hover:text-white text-sm"
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
            </button>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}

export default Auth;