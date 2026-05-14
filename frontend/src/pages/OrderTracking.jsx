import { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const API_URL = 'http://127.0.0.1:8000/api';
const BASE_URL = 'http://127.0.0.1:8000';

function OrderTracking() {
  const [orderId, setOrderId] = useState('');
  const [tracked, setTracked] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [trackHero, setTrackHero] = useState(null);
  const [error, setError] = useState('');

  // Check for theme
  useEffect(() => {
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains('dark') || 
                     document.body.classList.contains('dark') ||
                     localStorage.getItem('theme') === 'dark';
      setIsDarkTheme(isDark);
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    window.addEventListener('storage', checkTheme);

    return () => {
      observer.disconnect();
      window.removeEventListener('storage', checkTheme);
    };
  }, []);

  // Fetch track hero data
  useEffect(() => {
    fetchTrackHero();
  }, []);

  const fetchTrackHero = async () => {
    try {
      const response = await fetch(`${API_URL}/track-hero`);
      const result = await response.json();
      
      if (result.success && result.data) {
        setTrackHero({
          ...result.data,
          image: `${BASE_URL}${result.data.image}`
        });
      }
    } catch (error) {
      console.error('Error fetching track hero:', error);
    }
  };

  const handleTrack = async (e) => {
    e.preventDefault();
    setError('');
    
    if (orderId.trim()) {
      setIsLoading(true);
      
      try {
        const response = await fetch(`${API_URL}/track-order/${orderId}`);
        const result = await response.json();
        
        if (result.success && result.data) {
          setTracked(result.data);
        } else {
          setError('Order not found. Please check your Order ID.');
          setTracked(null);
        }
      } catch (error) {
        console.error('Error tracking order:', error);
        setError('Network error. Please try again.');
        setTracked(null);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'delivered': return 'text-green-500';
      case 'shipped': return 'text-blue-500';
      case 'processing': return 'text-yellow-500';
      case 'pending': return 'text-orange-500';
      case 'cancelled': return 'text-red-500';
      default: return isDarkTheme ? 'text-white' : 'text-gray-900';
    }
  };

  const getStatusSteps = (status, createdAt) => {
    const createdDate = new Date(createdAt);
    const steps = [
      { name: 'Order Placed', completed: true, date: createdDate.toLocaleDateString() },
      { name: 'Processing', completed: ['processing', 'shipped', 'delivered'].includes(status), date: null },
      { name: 'Shipped', completed: ['shipped', 'delivered'].includes(status), date: null },
      { name: 'Delivered', completed: status === 'delivered', date: null }
    ];
    return steps;
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Your order has been received and is awaiting processing',
      processing: 'Your order is being processed',
      shipped: 'Your order has been shipped',
      delivered: 'Your order has been delivered',
      cancelled: 'Your order has been cancelled'
    };
    return texts[status] || 'Order status unknown';
  };

  return (
    <div className={`min-h-screen ${isDarkTheme ? 'bg-black' : 'bg-gray-50'}`}>
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={trackHero?.image || `${BASE_URL}/images/15.webp`}
            alt={trackHero?.title || 'Track Order'}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('Track hero image failed to load:', trackHero?.image);
              e.target.src = `${BASE_URL}/images/15.webp`;
            }}
          />
          <div className={`absolute inset-0 ${isDarkTheme ? 'bg-black/60' : 'bg-black/40'}`} />
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-wider" style={{ color: 'white' }}>
            {trackHero?.title || 'Track Order'}
          </h1>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            {trackHero?.subtitle || 'Follow your package every step of the way'}
          </p>
          <div className="w-24 h-px bg-white/20 mx-auto mt-8" />
        </div>
      </section>

      {/* Tracking Form Section */}
      <section className="py-16 px-4 max-w-4xl mx-auto">
        <div className={`${isDarkTheme ? 'bg-black border-white/10' : 'bg-white border-gray-200'} rounded-2xl border p-6 md:p-8`}>
          <div className="text-center mb-6">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${isDarkTheme ? 'bg-white/10' : 'bg-gray-100'} flex items-center justify-center`}>
              <svg className={`w-8 h-8 ${isDarkTheme ? 'text-white' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 className={`text-2xl md:text-3xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-900'} mb-2`}>Track Your Order</h2>
            <p className={`${isDarkTheme ? 'text-white/50' : 'text-gray-500'} text-sm`}>Enter your order ID to get real-time updates</p>
          </div>

          <form onSubmit={handleTrack} className="mb-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Enter your order ID (e.g., LXE1778761913270)"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className={`flex-1 ${isDarkTheme ? 'bg-white/5 border-white/20 text-white placeholder-white/40' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'} border rounded-xl px-5 py-3 focus:outline-none transition-colors`}
                required
              />
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-3 bg-white text-black rounded-xl font-semibold hover:bg-gray-200 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
              >
                {isLoading ? 'Tracking...' : 'Track Order'}
              </button>
            </div>
          </form>
          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}
          <p className={`${isDarkTheme ? 'text-white/30' : 'text-gray-400'} text-xs text-center`}>
            Order ID can be found in your confirmation email
          </p>
        </div>
      </section>

      {/* Order Details */}
      {tracked && (
        <section className="py-8 px-4 max-w-4xl mx-auto animate-fadeInUp">
          {/* Status Card */}
          <div className={`bg-gradient-to-r ${isDarkTheme ? 'from-white/10 to-white/5 border-white/10' : 'from-gray-100 to-gray-50 border-gray-200'} rounded-2xl p-6 mb-6 border`}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <p className={`${isDarkTheme ? 'text-white/40' : 'text-gray-500'} text-sm`}>ORDER STATUS</p>
                <h3 className={`text-2xl font-bold ${getStatusColor(tracked.status)}`}>
                  {tracked.status.charAt(0).toUpperCase() + tracked.status.slice(1)}
                </h3>
                <p className={`${isDarkTheme ? 'text-white/60' : 'text-gray-600'} text-sm mt-1`}>{getStatusText(tracked.status)}</p>
              </div>
              <div className="text-right">
                <p className={`${isDarkTheme ? 'text-white/40' : 'text-gray-500'} text-sm`}>ORDER DATE</p>
                <p className={`${isDarkTheme ? 'text-white' : 'text-gray-900'} font-semibold text-lg`}>{tracked.date}</p>
              </div>
            </div>
          </div>

          {/* Timeline - Without Time */}
          <div className={`${isDarkTheme ? 'bg-black border-white/10' : 'bg-white border-gray-200'} rounded-2xl border p-6 md:p-8 mb-6`}>
            <h3 className={`text-xl font-semibold ${isDarkTheme ? 'text-white' : 'text-gray-900'} mb-6 flex items-center gap-2`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3M12 2a10 10 0 100 20 10 10 0 000-20z" />
              </svg>
              Order Timeline
            </h3>
            <div className="relative">
              <div className={`absolute left-5 top-0 bottom-0 w-px ${isDarkTheme ? 'bg-white/10' : 'bg-gray-200'}`} />
              <div className="space-y-8">
                {tracked.steps?.map((step, index) => (
                  <div key={step.name} className="relative flex items-start gap-4">
                    <div className={`w-4 h-4 rounded-full mt-1 ${step.completed ? 'bg-green-500' : isDarkTheme ? 'bg-white/20' : 'bg-gray-300'} z-10 ring-4 ${isDarkTheme ? 'ring-black' : 'ring-white'}`} />
                    <div className="flex-1">
                      <div>
                        <p className={`font-semibold ${step.completed ? (isDarkTheme ? 'text-white' : 'text-gray-900') : (isDarkTheme ? 'text-white/40' : 'text-gray-400')}`}>
                          {step.name}
                        </p>
                        {step.date && (
                          <p className={`${isDarkTheme ? 'text-white/40' : 'text-gray-500'} text-sm mt-1`}>{step.date}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Info Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className={`${isDarkTheme ? 'bg-black border-white/10' : 'bg-white border-gray-200'} rounded-xl border p-5`}>
              <div className="flex items-center gap-3 mb-3">
                <svg className={`w-5 h-5 ${isDarkTheme ? 'text-white/40' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <h4 className={`${isDarkTheme ? 'text-white' : 'text-gray-900'} font-semibold`}>Order Summary</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className={`${isDarkTheme ? 'text-white/50' : 'text-gray-500'}`}>Order ID</span>
                  <span className={`${isDarkTheme ? 'text-white/80' : 'text-gray-700'}`}>{tracked.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className={`${isDarkTheme ? 'text-white/50' : 'text-gray-500'}`}>Items</span>
                  <span className={`${isDarkTheme ? 'text-white/80' : 'text-gray-700'}`}>{tracked.items} products</span>
                </div>
                <div className="flex justify-between">
                  <span className={`${isDarkTheme ? 'text-white/50' : 'text-gray-500'}`}>Total Amount</span>
                  <span className={`${isDarkTheme ? 'text-white' : 'text-gray-900'} font-semibold`}>${tracked.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className={`${isDarkTheme ? 'text-white/50' : 'text-gray-500'}`}>Placed On</span>
                  <span className={`${isDarkTheme ? 'text-white/80' : 'text-gray-700'}`}>{tracked.date}</span>
                </div>
              </div>
            </div>

            <div className={`${isDarkTheme ? 'bg-black border-white/10' : 'bg-white border-gray-200'} rounded-xl border p-5`}>
              <div className="flex items-center gap-3 mb-3">
                <svg className={`w-5 h-5 ${isDarkTheme ? 'text-white/40' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <h4 className={`${isDarkTheme ? 'text-white' : 'text-gray-900'} font-semibold`}>Shipping & Payment</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className={`${isDarkTheme ? 'text-white/50' : 'text-gray-500'}`}>Shipping Address</span>
                  <span className={`${isDarkTheme ? 'text-white/80' : 'text-gray-700'} text-right`}>{tracked.shippingAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className={`${isDarkTheme ? 'text-white/50' : 'text-gray-500'}`}>Payment Method</span>
                  <span className={`${isDarkTheme ? 'text-white/80' : 'text-gray-700'}`}>{tracked.paymentMethod}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className={`${isDarkTheme ? 'bg-white/5' : 'bg-gray-100'} rounded-xl p-6 text-center`}>
            <p className={`${isDarkTheme ? 'text-white/60' : 'text-gray-600'} mb-3`}>Need help with your order?</p>
            <div className="flex justify-center gap-4">
              <a href="/contact" className={`${isDarkTheme ? 'text-white' : 'text-gray-900'} hover:${isDarkTheme ? 'text-white/80' : 'text-gray-600'} text-sm underline`}>Contact Support</a>
              <span className={`${isDarkTheme ? 'text-white/30' : 'text-gray-400'}`}>|</span>
              <a href="/faq" className={`${isDarkTheme ? 'text-white' : 'text-gray-900'} hover:${isDarkTheme ? 'text-white/80' : 'text-gray-600'} text-sm underline`}>FAQ</a>
            </div>
          </div>
        </section>
      )}

      {/* Help Section (when no order tracked) */}
      {!tracked && !isLoading && !error && (
        <section className="py-12 px-4 max-w-4xl mx-auto">
          <div className="text-center">
            <div className={`w-20 h-20 mx-auto mb-6 rounded-full ${isDarkTheme ? 'bg-white/5' : 'bg-gray-100'} flex items-center justify-center`}>
              <svg className={`w-10 h-10 ${isDarkTheme ? 'text-white/30' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className={`text-xl font-semibold ${isDarkTheme ? 'text-white' : 'text-gray-900'} mb-2`}>No Order Tracked Yet</h3>
            <p className={`${isDarkTheme ? 'text-white/50' : 'text-gray-500'} text-sm max-w-md mx-auto`}>
              Enter your order ID above to see the real-time status of your shipment
            </p>
          </div>
        </section>
      )}

      {/* Newsletter Section */}
      <section className={`py-20 px-4 border-t ${isDarkTheme ? 'border-white/10' : 'border-gray-200'}`}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className={`text-3xl md:text-4xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-900'} mb-4`}>Join Our Newsletter</h2>
          <p className={`${isDarkTheme ? 'text-white/50' : 'text-gray-500'} mb-8`}>Subscribe to get exclusive offers and updates</p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className={`flex-1 ${isDarkTheme ? 'bg-white/5 border-white/20 text-white placeholder-white/40' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'} border rounded-xl px-5 py-3 focus:outline-none transition-colors`}
            />
            <button className="px-8 py-3 bg-white text-black rounded-xl font-semibold hover:bg-gray-200 transition-all hover:scale-105">
              Subscribe
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default OrderTracking;