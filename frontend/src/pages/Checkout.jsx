import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const BASE_URL = 'http://127.0.0.1:8000';
const API_URL = 'http://127.0.0.1:8000/api';

function Checkout() {
  const navigate = useNavigate();
  const { cartItems, clearCart, getCartTotal } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    street_address: '',
    city: '',
    zipcode: '',
    country: 'Pakistan'
  });

  useEffect(() => {
    // If user is logged in, pre-fill form
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        full_name: user.name || '',
        email: user.email || ''
      }));
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    // If cart is empty, redirect to shop
    if (cartItems.length === 0) {
      navigate('/shop');
    }
  }, [cartItems, navigate]);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 0;
  const total = subtotal + shipping;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Don't create order yet, just go to payment page with data
    const orderData = {
      user_id: isAuthenticated ? user?.id : null,
      customer_name: formData.full_name,
      customer_email: formData.email,
      customer_phone: formData.phone,
      shipping_address: `${formData.street_address}, ${formData.city}, ${formData.zipcode}, ${formData.country}`,
      items: cartItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      })),
      subtotal: subtotal,
      shipping: shipping,
      total: total,
      status: 'pending_payment'
    };
    
    // Navigate to payment page with order data
    navigate('/payment', { state: { orderData } });
  };

  if (cartItems.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[30vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="/images/15.webp" alt="Checkout Hero" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-wider text-white">Checkout</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">Complete your purchase</p>
          <div className="w-24 h-px bg-white/20 mx-auto mt-6" />
        </div>
      </section>

      {/* Checkout Form */}
      <section className="py-12 px-4 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Billing Form */}
          <div className="bg-black rounded-xl border border-white/10 p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Billing Details</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white/70 text-sm mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-5 py-3 text-white focus:outline-none focus:border-white/50"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-5 py-3 text-white focus:outline-none focus:border-white/50"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-5 py-3 text-white focus:outline-none focus:border-white/50"
                  placeholder="+92 300 1234567"
                />
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-1">Street Address *</label>
                <input
                  type="text"
                  required
                  value={formData.street_address}
                  onChange={(e) => setFormData({...formData, street_address: e.target.value})}
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-5 py-3 text-white focus:outline-none focus:border-white/50"
                  placeholder="House #, Street, Area"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 text-sm mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-5 py-3 text-white focus:outline-none focus:border-white/50"
                    placeholder="Karachi"
                  />
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-1">Zipcode *</label>
                  <input
                    type="text"
                    required
                    value={formData.zipcode}
                    onChange={(e) => setFormData({...formData, zipcode: e.target.value})}
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-5 py-3 text-white focus:outline-none focus:border-white/50"
                    placeholder="12345"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-1">Country</label>
                <select
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-5 py-3 text-white focus:outline-none focus:border-white/50"
                >
                  <option value="Pakistan">Pakistan</option>
                  <option value="India">India</option>
                  <option value="USA">USA</option>
                  <option value="UAE">UAE</option>
                  <option value="UK">UK</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-3 bg-white text-black rounded-xl font-semibold hover:bg-gray-200 transition-all disabled:opacity-50"
              >
                Proceed to Payment
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-black rounded-xl border border-white/10 p-6 h-fit sticky top-24">
            <h2 className="text-xl font-bold text-white mb-4">Order Summary</h2>
            
            <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center border-b border-white/10 pb-2">
                  <div>
                    <p className="text-white text-sm">{item.name}</p>
                    <p className="text-white/40 text-xs">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-white">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-4 border-t border-white/10">
              <div className="flex justify-between">
                <span className="text-white/60">Subtotal</span>
                <span className="text-white">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Shipping</span>
                <span className="text-green-500">FREE</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-white/10">
                <span className="text-white font-bold text-lg">Total</span>
                <span className="text-white font-bold text-xl">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Checkout;