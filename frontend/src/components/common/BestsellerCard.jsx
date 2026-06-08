import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const BASE_URL = 'http://127.0.0.1:8000';

const toastConfig = {
  position: "bottom-right",
  autoClose: 3000,
  theme: "dark",
};

function BestsellerCard({ product }) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart();
  const { isAuthenticated } = useAuth();

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `${BASE_URL}${imagePath}`;
  };

  const mainImage = getImageUrl(product.image);
  
  let hoverImage = mainImage;
  if (product.hover_image) {
    hoverImage = getImageUrl(product.hover_image);
  }

  const handleQuickView = () => {
    navigate(`/bestseller/${product.id}`);
  };

  const requireLogin = () => {
    localStorage.setItem('redirectAfterLogin', window.location.pathname);
    navigate('/auth');
    toast.warning('Please login to continue!', toastConfig);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      requireLogin();
      return;
    }
    
    const cartItem = {
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      image: product.image,
      quantity: 1
    };
    
    addToCart(cartItem);
    toast.success(`${product.name} added to cart!`, toastConfig);
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      requireLogin();
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

  return (
    <div 
      className="bg-gradient-to-br from-gray-900 to-black rounded-xl overflow-hidden border border-white/10 transition-all duration-300 hover:border-white/30 hover:shadow-2xl hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-64 overflow-hidden">
        <img
          src={isHovered && hoverImage !== mainImage ? hoverImage : mainImage}
          alt={product.name}
          className="w-full h-full object-cover transition-all duration-700"
          onError={(e) => {
            e.target.src = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'300\' height=\'300\' viewBox=\'0 0 300 300\'%3E%3Crect width=\'300\' height=\'300\' fill=\'%23333333\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' dy=\'.3em\' fill=\'%23666666\' font-size=\'14\'%3ENo Image%3C/text%3E%3C/svg%3E';
          }}
        />
        
        {isHovered && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center gap-3 z-20">
            <button 
              onClick={handleQuickView} 
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all hover:scale-110"
              title="Quick View"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
            
            <button 
              onClick={handleWishlist} 
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 ${
                isInWishlist(product.id) 
                  ? 'bg-white text-black' 
                  : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
              title={isInWishlist(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
            >
              <svg className="w-5 h-5" fill={isInWishlist(product.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            
            {/* ✅ CART ICON - Shopping Cart wala */}
            <button 
              onClick={handleAddToCart} 
              className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center hover:bg-gray-200 transition-all hover:scale-110"
              title="Add to Cart"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6M17 13l1.5 6M9 21h6" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <div onClick={handleQuickView} className="cursor-pointer">
        <div className="p-4">
          <h3 className="text-lg font-semibold text-white mb-1 line-clamp-1 hover:text-gray-300 transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-white font-bold text-lg">${product.price}</span>
            {product.rating && (
              <div className="flex items-center gap-1">
                <span className="text-yellow-500 text-sm">★</span>
                <span className="text-gray-400 text-sm">{product.rating}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BestsellerCard;