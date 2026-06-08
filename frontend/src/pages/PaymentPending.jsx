import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const API_URL = 'http://127.0.0.1:8000/api';

const toastConfig = {
  position: "bottom-right",
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "dark",
};

function PaymentPending() {
  const location = useLocation();
  const [screenshot, setScreenshot] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  
  // ✅ Get full order_id from location state
  const [orderId, setOrderId] = useState(() => {
    // First try location state - get the actual order_id (not numeric id)
    let id = location.state?.orderId;
    
    // If orderId is numeric, try to get from localStorage
    if (id && !isNaN(parseInt(id))) {
      const savedOrderId = localStorage.getItem('lastOrderId');
      if (savedOrderId && !savedOrderId.startsWith('TEMP-')) {
        return savedOrderId;
      }
    }
    
    if (id && !id.startsWith('TEMP-')) {
      return id;
    }
    
    // Then try localStorage
    const savedOrderId = localStorage.getItem('lastOrderId');
    if (savedOrderId && !savedOrderId.startsWith('TEMP-')) {
      return savedOrderId;
    }
    
    // Finally generate a temporary ID
    return 'TEMP-' + Date.now();
  });

  // ✅ Save FULL order ID to localStorage
  useEffect(() => {
    if (orderId && typeof orderId === 'string' && !orderId.startsWith('TEMP-') && !orderId.startsWith('pending-')) {
      localStorage.setItem('lastOrderId', orderId);
    }
  }, [orderId]);

  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB', toastConfig);
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file (JPG, PNG)', toastConfig);
        return;
      }
      setScreenshot(file);
      toast.success('File selected successfully!', toastConfig);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!screenshot) {
      toast.error('Please select a screenshot first', toastConfig);
      return;
    }

    setUploading(true);
    
    const formData = new FormData();
    formData.append('screenshot', screenshot);
    if (orderId && typeof orderId === 'string' && !orderId.startsWith('TEMP-')) {
      formData.append('order_id', orderId);
    }

    try {
      const response = await fetch(`${API_URL}/upload-payment-proof`, {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        setUploaded(true);
        toast.success('Payment proof uploaded successfully! Admin will review it.', toastConfig);
      } else {
        toast.error(result.message || 'Upload failed. Please try again.', toastConfig);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Network error. Please try again.', toastConfig);
    } finally {
      setUploading(false);
    }
  };

  if (uploaded) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <section className="py-20 px-4 max-w-2xl mx-auto text-center">
          <div className="bg-green-500/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Thank You!</h1>
          
          {/* ✅ Show full Order ID prominently */}
          {orderId && typeof orderId === 'string' && !orderId.startsWith('TEMP-') && (
            <div className="bg-yellow-500/20 border border-yellow-500/40 rounded-lg p-3 mb-6 inline-block">
              <p className="text-yellow-400 text-sm">Order ID</p>
              <p className="text-white font-bold text-xl">{orderId}</p>
            </div>
          )}
          
          <p className="text-white/60 mb-8">
            Your payment proof has been submitted successfully. Admin will review it and approve your order within 24 hours.
          </p>
          <div className="bg-gray-900 rounded-xl p-6 mb-8 text-left">
            <h3 className="text-white font-semibold mb-3">What's Next?</h3>
            <ul className="text-white/60 space-y-2 text-sm">
              <li>✓ Admin will verify your payment</li>
              <li>✓ You will receive email confirmation once approved</li>
              <li>✓ Order status can be tracked on Track Order page</li>
            </ul>
          </div>
          <div className="flex gap-4 justify-center">
            <Link to={`/track-order?orderId=${orderId}`} className="px-6 py-3 bg-white text-black rounded-xl font-semibold hover:bg-gray-200 transition-all">
              Track Order
            </Link>
            <Link to="/shop" className="px-6 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all">
              Continue Shopping
            </Link>
          </div>
        </section>
        <Footer />
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <section className="relative h-[30vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="/images/15.webp" alt="Payment Pending" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-wider text-white">Payment Pending</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">Upload your payment proof</p>
          <div className="w-24 h-px bg-white/20 mx-auto mt-6" />
        </div>
      </section>

      <section className="py-16 px-4 max-w-2xl mx-auto">
        <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-white/10 p-8">
          <div className="text-center mb-8">
            <div className="bg-yellow-500/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3M12 2a10 10 0 100 20 10 10 0 000-20z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Upload Payment Screenshot</h2>
            <p className="text-white/50 text-sm">Please upload a screenshot of your payment confirmation</p>
          </div>

          {/* ✅ Show FULL Order ID */}
          <div className="mb-4 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/40 rounded-lg text-center">
            <p className="text-green-400 text-sm uppercase tracking-wide">Order Reference</p>
            <p className="text-white font-bold text-2xl mt-1 tracking-wider">
              {orderId && !orderId.startsWith('TEMP-') ? orderId : 'Processing...'}
            </p>
            <p className="text-white/40 text-xs mt-2">
              Use this Order ID to track your order
            </p>
          </div>

          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
            <h3 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Instructions
            </h3>
            <ul className="text-white/60 text-sm space-y-1">
              <li>• Upload clear screenshot of payment confirmation</li>
              <li>• Screenshot should show transaction ID and amount</li>
              <li>• File format: JPG, PNG (Max 5MB)</li>
            </ul>
          </div>

          <form onSubmit={handleUpload} className="space-y-6">
            <div>
              <label className="block text-white/70 text-sm mb-2">Payment Screenshot *</label>
              <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-yellow-500/50 transition-all cursor-pointer bg-white/5">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleScreenshotChange}
                  className="hidden"
                  id="screenshot-upload"
                />
                <label htmlFor="screenshot-upload" className="cursor-pointer block">
                  {screenshot ? (
                    <div className="space-y-2">
                      <svg className="w-12 h-12 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <p className="text-green-500 text-sm">File selected: {screenshot.name}</p>
                      <p className="text-white/40 text-xs">Click to change</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <svg className="w-12 h-12 text-white/40 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-white/60 text-sm">Click or drag to upload screenshot</p>
                      <p className="text-white/40 text-xs">PNG, JPG up to 5MB</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={uploading || !screenshot}
              className="w-full py-3 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white rounded-xl font-semibold hover:from-yellow-700 hover:to-yellow-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Uploading...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Upload Payment Proof
                </span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/track-order" className="text-white/40 text-sm hover:text-white/60 transition-colors">
              Skip for now? Track your order later →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <ToastContainer />
    </div>
  );
}

export default PaymentPending;