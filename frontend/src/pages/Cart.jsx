import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { useCart } from '../context/CartContext';

const BASE_URL = 'http://127.0.0.1:8000';

function Cart() {
  const { cartItems, removeFromCart, updateQuantity } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `${BASE_URL}${imagePath}`;
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 0;  // ← FREE SHIPPING
  const total = subtotal + shipping;

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[30vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="/images/15.webp" alt="Cart Hero" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-wider text-white">Your Cart</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">{cartItems.length} items in your cart</p>
          <div className="w-24 h-px bg-white/20 mx-auto mt-6" />
        </div>
      </section>

      {/* Cart Content */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        {cartItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/10 flex items-center justify-center">
              <svg className="w-12 h-12 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6M17 13l1.5 6M9 21h6M12 15v6" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Your cart is empty</h3>
            <p className="text-white/50 mb-6">Looks like you haven't added any items yet.</p>
            <Link to="/shop" className="px-6 py-3 bg-white text-black rounded-xl font-semibold hover:bg-gray-200 transition-all hover:scale-105 inline-block">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-black rounded-xl border border-white/10 p-4 flex gap-4">
                  <img 
                    src={getImageUrl(item.image)} 
                    alt={item.name} 
                    className="w-24 h-24 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/100x100?text=No+Image';
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="text-white font-semibold">{item.name}</h3>
                    <p className="text-white/40 text-sm">Price: ${item.price}</p>
                    {item.size && <p className="text-white/40 text-sm">Size: {item.size}</p>}
                    <div className="flex items-center gap-3 mt-2">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                        className="w-8 h-8 rounded-full bg-white/10 text-white hover:bg-white/20"
                      >
                        -
                      </button>
                      <span className="text-white">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                        className="w-8 h-8 rounded-full bg-white/10 text-white hover:bg-white/20"
                      >
                        +
                      </button>
                      <button 
                        onClick={() => removeFromCart(item.id)} 
                        className="ml-auto text-red-500 text-sm hover:text-red-400"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                    {item.oldPrice && (
                      <p className="text-white/40 line-through text-sm">${item.oldPrice}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary - Free Shipping */}
            <div className="bg-black rounded-xl border border-white/10 p-6 h-fit sticky top-24">
              <h3 className="text-xl font-bold text-white mb-4">Order Summary</h3>
              <div className="space-y-3 pb-4 border-b border-white/10">
                <div className="flex justify-between">
                  <span className="text-white/60">Subtotal</span>
                  <span className="text-white">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Shipping</span>
                  <span className="text-white text-green-500">FREE</span>
                </div>
              </div>
              <div className="flex justify-between mt-4 pb-4">
                <span className="text-white font-semibold">Total</span>
                <span className="text-white font-bold text-xl">${total.toFixed(2)}</span>
              </div>
              <button className="w-full mt-6 py-3 bg-white text-black rounded-xl font-semibold hover:bg-gray-200 transition-all hover:scale-105">
                Proceed to Checkout
              </button>
              <Link to="/shop" className="block text-center mt-4 text-white/50 text-sm hover:text-white">
                Continue Shopping →
              </Link>
            </div>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}

export default Cart;