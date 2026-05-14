import { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

function OrderSuccess() {
  const location = useLocation();
  const order = location.state?.order;

  useEffect(() => {
    if (!order) {
      window.location.href = '/shop';
    }
  }, [order]);

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <section className="py-16 px-4 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Thank You for Your Order!</h1>
          <p className="text-white/60">Your order has been placed successfully. Order ID: #{order.id}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Order Items */}
          <div className="bg-black rounded-xl border border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Order Items</h2>
            {order.items?.map((item, index) => (
              <div key={index} className="flex justify-between border-b border-white/10 py-2">
                <div>
                  <p className="text-white">{item.name}</p>
                  <p className="text-white/40 text-sm">Qty: {item.quantity}</p>
                </div>
                <p className="text-white">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
            <div className="mt-4 pt-3 border-t border-white/10">
              <div className="flex justify-between">
                <span className="text-white/60">Subtotal</span>
                <span className="text-white">${order.subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Shipping</span>
                <span className="text-green-500">FREE</span>
              </div>
              <div className="flex justify-between mt-3 pt-3 border-t border-white/10">
                <span className="text-white font-bold">Total</span>
                <span className="text-white font-bold text-xl">${order.total?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-black rounded-xl border border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Payment Details</h2>
            <div className="space-y-3">
              <div>
                <p className="text-white/40 text-sm">Bank Name</p>
                <p className="text-white">Zelle / Bank Transfer</p>
              </div>
              <div>
                <p className="text-white/40 text-sm">Account Title</p>
                <p className="text-white">LUXE Store</p>
              </div>
              <div>
                <p className="text-white/40 text-sm">Account Number</p>
                <p className="text-white">+1 (254) 715 2632</p>
              </div>
            </div>
          </div>

          {/* Shipping Details */}
          <div className="bg-black rounded-xl border border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Shipping Details</h2>
            <div className="space-y-2">
              <p><span className="text-white/40">Name:</span> <span className="text-white">{order.customer_name}</span></p>
              <p><span className="text-white/40">Email:</span> <span className="text-white">{order.customer_email}</span></p>
              <p><span className="text-white/40">Phone:</span> <span className="text-white">{order.customer_phone}</span></p>
              <p><span className="text-white/40">Address:</span> <span className="text-white">{order.shipping_address}</span></p>
              <p><span className="text-white/40">Order Date:</span> <span className="text-white">{new Date(order.created_at).toLocaleDateString()}</span></p>
              <p><span className="text-white/40">Order ID:</span> <span className="text-white">#{order.id}</span></p>
            </div>
          </div>

          {/* Payment QR */}
          <div className="bg-black rounded-xl border border-white/10 p-6 text-center">
            <h2 className="text-xl font-bold text-white mb-4">Scan & Pay</h2>
            <div className="bg-white rounded-xl p-4 inline-block mx-auto mb-4">
              <svg className="w-32 h-32" viewBox="0 0 100 100">
                <rect width="100" height="100" fill="black" />
                {[...Array(20)].map((_, i) => (
                  <rect key={i} x={Math.random() * 80 + 10} y={Math.random() * 80 + 10} width="3" height="3" fill="white" />
                ))}
              </svg>
            </div>
            <p className="text-white/60 text-sm mb-2">Scan QR code to pay</p>
            <button className="px-6 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all">
              Download QR
            </button>
            <div className="mt-6 pt-4 border-t border-white/10">
              <p className="text-white font-bold text-xl">AMOUNT TO PAY</p>
              <p className="text-white font-bold text-3xl">${order.total?.toFixed(2)}</p>
              <p className="text-yellow-500 text-sm mt-2">Please transfer exact amount within 24 hours</p>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link to="/shop" className="inline-block px-6 py-3 bg-white text-black rounded-xl font-semibold hover:bg-gray-200 transition-all">
            Continue Shopping
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default OrderSuccess;