import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const API_URL = 'http://127.0.0.1:8000/api';
const BASE_URL = 'http://127.0.0.1:8000';

function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [createdOrderId, setCreatedOrderId] = useState(null);

  useEffect(() => {
    if (location.state?.orderData) {
      setOrderData(location.state.orderData);
    } else {
      navigate('/cart');
    }
  }, [location]);

  const handlePaymentConfirm = async (e) => {
    e.preventDefault();
    
    // First create order
    setLoading(true);
    try {
      const orderResponse = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      const orderResult = await orderResponse.json();

      if (orderResult.success) {
        setCreatedOrderId(orderResult.data.id);
        clearCart();
        setPaymentConfirmed(true);
      } else {
        alert(orderResult.message || 'Order creation failed');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSubmit = () => {
    // Navigate to payment pending with order ID
    navigate('/payment-pending', { state: { orderId: createdOrderId } });
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal;

  if (!orderData) {
    return null;
  }

  if (paymentConfirmed) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <section className="py-20 px-4 max-w-2xl mx-auto text-center">
          <div className="bg-green-500/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Payment Successful!</h1>
          <p className="text-white/60 mb-8">Your payment has been confirmed. Click below to complete your order.</p>
          <button
            onClick={handleFinalSubmit}
            disabled={loading}
            className="px-8 py-3 bg-white text-black rounded-xl font-semibold hover:bg-gray-200 transition-all disabled:opacity-50"
          >
            Complete Order
          </button>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="/images/15.webp" alt="Payment Hero" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-wider text-white drop-shadow-lg">
            Scan & Pay
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto drop-shadow">
            Complete your payment by scanning the QR code
          </p>
          <div className="w-24 h-px bg-white/20 mx-auto mt-8" />
        </div>
      </section>

      <section className="py-16 px-4 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-10">
          {/* QR Code Section */}
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-white/10 p-8 text-center">
            <div className="mb-6">
              <div className="bg-white rounded-2xl p-6 inline-block shadow-2xl">
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://wa.me/923322751363?text=I%20want%20to%20pay%20for%20order"
                  alt="QR Code"
                  className="w-64 h-64 mx-auto"
                />
              </div>
              <p className="text-white/60 text-sm mt-4 flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                Scan with your banking app
              </p>
            </div>

            <div className="mb-6 p-5 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
              <p className="text-yellow-500 text-sm mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                How to Pay
              </p>
              <ul className="text-white/70 text-sm space-y-2 text-left">
                <li className="flex items-center gap-2"><span className="w-5 h-5 bg-yellow-500/20 rounded-full flex items-center justify-center text-yellow-400 text-xs">1</span> Open your banking app</li>
                <li className="flex items-center gap-2"><span className="w-5 h-5 bg-yellow-500/20 rounded-full flex items-center justify-center text-yellow-400 text-xs">2</span> Scan the QR code above</li>
                <li className="flex items-center gap-2"><span className="w-5 h-5 bg-yellow-500/20 rounded-full flex items-center justify-center text-yellow-400 text-xs">3</span> Enter amount: <span className="text-yellow-400 font-bold text-base">${total.toFixed(2)}</span></li>
                <li className="flex items-center gap-2"><span className="w-5 h-5 bg-yellow-500/20 rounded-full flex items-center justify-center text-yellow-400 text-xs">4</span> Confirm payment</li>
                <li className="flex items-center gap-2"><span className="w-5 h-5 bg-yellow-500/20 rounded-full flex items-center justify-center text-yellow-400 text-xs">5</span> Click "I have paid" button below</li>
              </ul>
            </div>

            <div className="mb-8 p-5 bg-blue-500/10 border border-blue-500/30 rounded-xl">
              <h3 className="text-blue-400 font-semibold mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Bank Account Details
              </h3>
              <div className="space-y-2 text-white/70 text-sm">
                <div className="flex justify-between py-1 border-b border-white/10">
                  <span className="text-white/50">Bank:</span>
                  <span className="text-white">Zelle / Bank Transfer</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/10">
                  <span className="text-white/50">Account Title:</span>
                  <span className="text-white">LUXE Store</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-white/50">Account Number:</span>
                  <span className="text-white font-mono">+1 (254) 715 2632</span>
                </div>
              </div>
            </div>

            <button
              onClick={handlePaymentConfirm}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-[1.02] shadow-lg disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'I have paid'}
            </button>
          </div>

          {/* Order Summary */}
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-white/10 p-6 h-fit sticky top-24">
            <h2 className="text-xl font-bold text-white mb-4 pb-3 border-b border-white/10 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Order Summary
            </h2>
            
            <div className="space-y-3 max-h-96 overflow-y-auto mb-4 custom-scrollbar">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b border-white/10">
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{item.name}</p>
                    <p className="text-white/40 text-xs">Quantity: {item.quantity}</p>
                  </div>
                  <p className="text-white font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-4 border-t border-white/10">
              <div className="flex justify-between">
                <span className="text-white/60">Subtotal</span>
                <span className="text-white">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Shipping</span>
                <span className="text-green-500">FREE</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-white/10">
                <span className="text-white font-bold text-lg">Total to Pay</span>
                <span className="text-white font-bold text-2xl text-yellow-400">${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-white/40 text-xs text-center leading-relaxed">
                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                After scanning QR code and making payment, click "I have paid" to confirm your order.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Payment;