import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://127.0.0.1:8000/api';
const BASE_URL = 'http://127.0.0.1:8000';

const toastConfig = {
  position: "bottom-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "dark",
};

function NewArrivalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/new-arrival/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          toast.error('Product not found!', toastConfig);
          navigate('/');
          return;
        }
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        const productData = {
          ...result.data,
          image: result.data.image ? `${BASE_URL}${result.data.image}` : null,
          hover_image: result.data.hover_image ? `${BASE_URL}${result.data.hover_image}` : null,
        };
        setProduct(productData);
      } else {
        toast.error(result.message || 'Product not found!', toastConfig);
        navigate('/');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product details!', toastConfig);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= 99) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.warning('Please login to add items to cart!', toastConfig);
      navigate('/auth');
      return;
    }
    
    const cartItem = { ...product, quantity };
    addToCart(cartItem);
    toast.success(`${product.name} added to cart!`, toastConfig);
  };

  const handleWishlist = () => {
    if (!isAuthenticated) {
      toast.warning('Please login to add items to wishlist!', toastConfig);
      navigate('/auth');
      return;
    }
    
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      toast.info(`${product.name} removed from wishlist`, toastConfig);
    } else {
      addToWishlist(product);
      toast.success(`${product.name} added to wishlist!`, toastConfig);
    }
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      toast.warning('Please login to checkout!', toastConfig);
      navigate('/auth');
      return;
    }
    
    const cartItem = { ...product, quantity };
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity = (existingItem.quantity || 1) + quantity;
    } else {
      cart.push(cartItem);
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    
    toast.info('Redirecting to checkout...', toastConfig);
    setTimeout(() => navigate('/checkout'), 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-white text-xl">Loading...</div>
        </div>
        <Footer />
        <ToastContainer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-screen">
          <div className="text-white text-xl mb-4">Product not found</div>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition-all"
          >
            Back to Home
          </button>
        </div>
        <Footer />
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <section className="py-12 px-4 max-w-7xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-white/60 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Shop
        </button>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Left - Product Image */}
          <div>
            <div className="rounded-2xl overflow-hidden bg-gray-900">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-auto object-cover"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'600\' height=\'600\' viewBox=\'0 0 600 600\'%3E%3Crect width=\'600\' height=\'600\' fill=\'%23333333\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' dy=\'.3em\' fill=\'%23666666\' font-size=\'16\'%3ENo Image%3C/text%3E%3C/svg%3E';
                }}
              />
            </div>
          </div>

          {/* Right - Product Info */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{product.name}</h1>
            
            <div className="flex items-center gap-4 mb-4">
              {product.rating && (
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500 text-sm">★</span>
                  <span className="text-white">{product.rating}</span>
                </div>
              )}
              {product.category && (
                <span className="text-white/40 text-sm uppercase tracking-wider">{product.category}</span>
              )}
            </div>

            {/* Simple Price - No cut price */}
            <div className="mb-6">
              <span className="text-3xl font-bold text-white">${product.price}</span>
            </div>

            <p className="text-white/60 leading-relaxed mb-6">
              {product.description || 'No description available for this product.'}
            </p>

            {product.features && (
              <div className="mb-6">
                <h3 className="text-white font-semibold mb-2">Features</h3>
                <ul className="list-disc list-inside text-white/50 space-y-1">
                  {typeof product.features === 'string' ? 
                    JSON.parse(product.features).map((feature, idx) => (
                      <li key={idx}>{feature}</li>
                    )) : 
                    product.features?.map((feature, idx) => (
                      <li key={idx}>{feature}</li>
                    ))
                  }
                </ul>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-white">Quantity:</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="w-8 h-8 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  -
                </button>
                <span className="text-white text-lg w-8 text-center">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="w-8 h-8 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 py-3 bg-white text-black rounded-xl font-semibold hover:bg-gray-200 transition-all hover:scale-105"
              >
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 py-3 bg-transparent border border-white/20 text-white rounded-xl font-semibold hover:bg-white/10 transition-all"
              >
                Buy Now
              </button>
              <button
                onClick={handleWishlist}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-105 ${
                  isInWishlist(product.id) 
                    ? 'bg-white text-black' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
                title={isInWishlist(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                <svg className="w-5 h-5" fill={isInWishlist(product.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>

            {product.in_stock === 0 && (
              <p className="mt-4 text-red-400 text-sm">Out of Stock</p>
            )}
          </div>
        </div>
      </section>

      <Footer />
      <ToastContainer />
    </div>
  );
}

export default NewArrivalDetail;