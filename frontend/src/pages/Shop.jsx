import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import ProductCard from '../components/common/ProductCard';

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

function Shop() {
  const [sort, setSort] = useState('default');
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [shopHero, setShopHero] = useState(null);
  
  // Newsletter states
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false);
  const [newsletterMessage, setNewsletterMessage] = useState('');
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

  const fixImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `${BASE_URL}${imagePath}`;
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    setNewsletterSubmitting(true);
    setNewsletterMessage('');
    
    try {
      const response = await fetch(`${API_URL}/subscribe-newsletter`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email: newsletterEmail })
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setNewsletterSuccess(true);
        setNewsletterMessage(result.message);
        toast.success(result.message, toastConfig);
        setNewsletterEmail('');
        setTimeout(() => {
          setNewsletterSuccess(false);
          setNewsletterMessage('');
        }, 3000);
      } else {
        setNewsletterSuccess(false);
        const errorMsg = result.message || 'Email already subscribed or invalid';
        setNewsletterMessage(errorMsg);
        toast.error(errorMsg, toastConfig);
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      const errorMsg = 'Network error. Please try again.';
      setNewsletterMessage(errorMsg);
      toast.error(errorMsg, toastConfig);
    } finally {
      setNewsletterSubmitting(false);
    }
  };

  useEffect(() => {
    fetchShopData();
  }, []);

  const fetchShopData = async () => {
    try {
      const productsResponse = await fetch(`${API_URL}/products`);
      const productsResult = await productsResponse.json();
      
      if (productsResult.success) {
        setProducts(productsResult.data);
      } else {
        toast.error('Failed to load products!', toastConfig);
      }
      
      try {
        const heroResponse = await fetch(`${API_URL}/shop-hero`);
        const heroResult = await heroResponse.json();
        
        if (heroResult.success && heroResult.data) {
          setShopHero({
            ...heroResult.data,
            image: fixImageUrl(heroResult.data.image)
          });
        }
      } catch (error) {
        console.log('Shop hero API not found, using default');
        setShopHero({
          id: 1,
          image: `${BASE_URL}/uploads/shop/hero_shop.webp`,
          title: 'Our Collection',
          subtitle: 'Discover premium craftsmanship and timeless design',
          active: 1
        });
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Network error! Failed to load products.', toastConfig);
    } finally {
      setLoading(false);
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    if (sort === 'price-low') return a.price - b.price;
    if (sort === 'price-high') return b.price - a.price;
    if (sort === 'rating') return b.rating - a.rating;
    return 0;
  });

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

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      {/* Hero Section - Same style as About page */}
      <section className="relative h-[40vh] md:h-[45vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={shopHero?.image || `${BASE_URL}/uploads/shop/hero_shop.webp`}
            alt={shopHero?.title || 'Shop'}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = `${BASE_URL}/uploads/shop/hero_shop.webp`;
            }}
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-3 tracking-wider" style={{ color: 'white' }}>
            {shopHero?.title || 'Our Collection'}
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            {shopHero?.subtitle || 'Discover premium craftsmanship and timeless design'}
          </p>
          <div className="w-20 h-px bg-white/20 mx-auto mt-6" />
        </div>
      </section>

      {/* Sort Section */}
      <section className="py-6 px-4 border-b border-white/10 sticky top-16 bg-black/95 backdrop-blur-sm z-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-end items-center">
            <div className="flex items-center gap-3">
              <span style={{ color: 'rgba(255, 255, 255, 0.4)' }} className="text-sm">Sort by:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-white/40"
                style={{ color: 'white' }}
              >
                <option value="default" style={{ color: 'black' }}>Default</option>
                <option value="price-low" style={{ color: 'black' }}>Price: Low to High</option>
                <option value="price-high" style={{ color: 'black' }}>Price: High to Low</option>
                <option value="rating" style={{ color: 'black' }}>Top Rated</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12 px-4 max-w-7xl mx-auto">
        {sortedProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/60 text-lg">No products found.</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <p className="text-white/40 text-sm">
                Showing <span style={{ color: 'white' }}>{sortedProducts.length}</span> products
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Newsletter */}
      <section className="py-20 px-4 border-t border-white/10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Join Our Newsletter</h2>
          <p className="text-white/50 mb-8">Subscribe to get exclusive offers and updates</p>
          <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              className="flex-1 bg-white/5 border border-white/20 rounded-xl px-5 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white/50"
              required
            />
            <button 
              type="submit"
              disabled={newsletterSubmitting}
              className="px-8 py-3 bg-white text-black rounded-xl font-semibold hover:bg-gray-200 transition-all hover:scale-105 disabled:opacity-50"
            >
              {newsletterSubmitting ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
          {newsletterMessage && (
            <p className={`mt-4 text-sm ${newsletterSuccess ? 'text-green-400' : 'text-red-400'}`}>
              {newsletterMessage}
            </p>
          )}
        </div>
      </section>

      <Footer />
      <ToastContainer />
    </div>
  );
}

export default Shop;