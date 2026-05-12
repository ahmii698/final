import { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import ProductCard from '../components/common/ProductCard';

const API_URL = 'http://127.0.0.1:8000/api';
const BASE_URL = 'http://127.0.0.1:8000';

function Shop() {
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('default');
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [shopHero, setShopHero] = useState(null);
  
  // Newsletter states
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false);
  const [newsletterMessage, setNewsletterMessage] = useState('');  // ← Fixed typo
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

  // Categories
  const categories = [
    { id: 'all', name: 'All Products', icon: 'M4 6h16M4 12h16M4 18h16' },
    { id: 'rings', name: 'Rings', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
    { id: 'chains', name: 'Chains', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' },
    { id: 'bracelets', name: 'Bracelets', icon: 'M12 8v4l3 3M12 2a10 10 0 100 20 10 10 0 000-20z' },
    { id: 'watches', name: 'Watches', icon: 'M12 8v4l3 3M12 2a10 10 0 100 20 10 10 0 000-20z' },
  ];

  // Helper function to fix image URLs
  const fixImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `${BASE_URL}${imagePath}`;
  };

  // Newsletter subscription handler
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
        setNewsletterEmail('');
        setTimeout(() => {
          setNewsletterSuccess(false);
          setNewsletterMessage('');
        }, 3000);
      } else {
        setNewsletterSuccess(false);
        setNewsletterMessage(result.message || 'Email already subscribed or invalid');
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      setNewsletterMessage('Network error. Please try again.');
    } finally {
      setNewsletterSubmitting(false);
    }
  };

  // Fetch products and shop hero from API
  useEffect(() => {
    fetchShopData();
  }, []);

  const fetchShopData = async () => {
    try {
      // Fetch products
      const productsResponse = await fetch(`${API_URL}/products`);
      const productsResult = await productsResponse.json();
      
      if (productsResult.success) {
        setProducts(productsResult.data);
      }
      
      // Fetch shop hero from shop_hero table
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
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort products
  const filteredProducts = products.filter(p => filter === 'all' || p.category === filter);
  const sortedProducts = [...filteredProducts].sort((a, b) => {
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      {/* Hero Section - Dynamic from shop_hero table */}
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={shopHero?.image || `${BASE_URL}/uploads/shop/hero_shop.webp`}
            alt={shopHero?.title || 'Shop'}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('Shop hero image failed to load:', shopHero?.image);
              e.target.src = `${BASE_URL}/uploads/shop/hero_shop.webp`;
            }}
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-wider" style={{ color: 'white' }}>
            {shopHero?.title || 'Our Collection'}
          </h1>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            {shopHero?.subtitle || 'Discover premium craftsmanship and timeless design'}
          </p>
          <div className="w-24 h-px bg-white/20 mx-auto mt-6" />
        </div>
      </section>

      {/* Category Filters */}
      <section className="py-8 px-4 border-b border-white/10 sticky top-16 bg-black/95 backdrop-blur-sm z-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setFilter(cat.id)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                    filter === cat.id
                      ? 'bg-white text-black'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                  style={filter !== cat.id ? { color: 'rgba(255, 255, 255, 0.7)' } : {}}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={filter !== cat.id ? { color: 'rgba(255, 255, 255, 0.7)' } : {}}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={cat.icon} />
                  </svg>
                  {cat.name}
                </button>
              ))}
            </div>

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
            <p className="text-white/60 text-lg">No products found in this category.</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <p className="text-white/40 text-sm">
                Showing <span className="text-white">{sortedProducts.length}</span> products
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
    </div>
  );
}

export default Shop;