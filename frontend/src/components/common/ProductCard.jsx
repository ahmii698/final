import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const BASE_URL = 'http://127.0.0.1:8000';

function ProductCard({ product }) {
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
  } else if (product.hoverImage) {
    hoverImage = getImageUrl(product.hoverImage);
  }

  const handleQuickView = () => {
    navigate(`/product/${product.id}`);
  };

  const requireLogin = () => {
    localStorage.setItem('redirectAfterLogin', window.location.pathname);
    navigate('/auth');
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      requireLogin();
      return;
    }
    addToCart(product);
    alert(`${product.name} added to cart!`);
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      requireLogin();
      return;
    }
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      alert(`${product.name} removed from wishlist`);
    } else {
      addToWishlist(product);
      alert(`${product.name} added to wishlist!`);
    }
  };

  return (
    <div 
      className="bg-gradient-to-br from-gray-900 to-black rounded-xl overflow-hidden border border-white/10 transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-64 overflow-hidden">
        <img
          src={isHovered ? hoverImage : mainImage}
          alt={product.name}
          className="w-full h-full object-cover transition-all duration-300"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
          }}
        />
        
        {isHovered && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center gap-3 z-10">
            <button onClick={handleQuickView} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
            
            <button onClick={handleWishlist} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isInWishlist(product.id) ? 'bg-red-500 text-white' : 'bg-white/20 hover:bg-white/30'}`}>
              <svg className="w-5 h-5" fill={isInWishlist(product.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            
            <button onClick={handleAddToCart} className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center hover:bg-gray-200 transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6M17 13l1.5 6M9 21h6M12 15v6" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <div onClick={handleQuickView} className="cursor-pointer">
        <div className="p-4">
          <h3 className="text-lg font-semibold text-white mb-1 line-clamp-1">{product.name}</h3>
          <div className="flex items-center justify-between">
            <div>
              {(product.old_price || product.oldPrice) ? (
                <>
                  <span className="text-white font-bold">${product.price}</span>
                  <span className="text-gray-500 line-through text-sm ml-2">${product.old_price || product.oldPrice}</span>
                </>
              ) : (
                <span className="text-white font-bold">${product.price}</span>
              )}
            </div>
            {product.rating && (
              <div className="flex items-center">
                <span className="text-yellow-500 text-sm">★</span>
                <span className="text-gray-400 text-sm ml-1">{product.rating}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;