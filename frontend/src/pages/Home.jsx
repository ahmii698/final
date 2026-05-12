import { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import ProductCard from '../components/common/ProductCard';

const API_URL = 'http://localhost:8000/api';
const BASE_URL = 'http://localhost:8000';

function Home() {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Newsletter states
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false);
  const [newsletterMessage, setNewsletterMessage] = useState('');
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);
  
  // Form data
  const [feedbackData, setFeedbackData] = useState({
    name: '',
    role: '',
    rating: 5,
    text: ''
  });
  
  // State for data from API
  const [banners, setBanners] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [soloBanner, setSoloBanner] = useState(null);
  const [newArrivals, setNewArrivals] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [features, setFeatures] = useState([]);

  // Helper function to fix image URLs
  const fixImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `${BASE_URL}${imagePath}`;
  };

  // Fetch all data from API
  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      console.log('Fetching home data...');
      const response = await fetch(`${API_URL}/home-data`);
      const result = await response.json();
      
      console.log('API Response received');
      
      if (result.success) {
        const fixedBanners = (result.data.banners || []).map(banner => ({
          ...banner,
          image: fixImageUrl(banner.image)
        }));
        
        const fixedSoloBanner = result.data.soloBanner ? {
          ...result.data.soloBanner,
          image: fixImageUrl(result.data.soloBanner.image)
        } : null;
        
        const fixedBestsellers = (result.data.bestsellers || []).map(product => ({
          ...product,
          image: fixImageUrl(product.image),
          hover_image: fixImageUrl(product.hover_image)
        }));
        
        const fixedNewArrivals = (result.data.newArrivals || []).map(product => ({
          ...product,
          image: fixImageUrl(product.image),
          hover_image: fixImageUrl(product.hover_image)
        }));
        
        setBanners(fixedBanners);
        setBestsellers(fixedBestsellers);
        setSoloBanner(fixedSoloBanner);
        setNewArrivals(fixedNewArrivals);
        
        const activeTestimonials = (result.data.testimonials || []).filter(t => t.active === 1);
        setTestimonials(activeTestimonials);
        setFeatures(result.data.features || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
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

  // Submit feedback with validation
  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    
    if (!feedbackData.name.trim()) {
      setSubmitMessage('Please enter your name');
      return;
    }
    if (feedbackData.text.trim().length < 5) {
      setSubmitMessage('Please write at least 5 characters for your feedback');
      return;
    }
    if (feedbackData.rating < 1 || feedbackData.rating > 5) {
      setSubmitMessage('Please select a rating');
      return;
    }
    
    setSubmitting(true);
    setSubmitMessage('');
    
    try {
      const response = await fetch(`${API_URL}/submit-testimonial`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(feedbackData)
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setSubmitSuccess(true);
        setSubmitMessage(result.message);
        setFeedbackData({
          name: '',
          role: '',
          rating: 5,
          text: ''
        });
        fetchHomeData();
        setTimeout(() => {
          setShowFeedbackModal(false);
          setSubmitSuccess(false);
          setSubmitMessage('');
        }, 3000);
      } else {
        if (result.errors) {
          const errors = Object.values(result.errors).flat();
          setSubmitMessage(errors.join(', '));
        } else {
          setSubmitMessage(result.message || 'Something went wrong. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSubmitMessage('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Star rating component
  const StarRating = ({ rating, onRatingChange }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className="focus:outline-none"
          >
            <svg
              className={`w-8 h-8 ${star <= rating ? 'text-yellow-500 fill-current' : 'text-gray-600 stroke-current'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        ))}
      </div>
    );
  };

  // Auto slide for banners
  useEffect(() => {
    if (banners.length === 0) return;
    const interval = setInterval(() => {
      nextBanner();
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  // Auto slide for testimonials
  useEffect(() => {
    if (testimonials.length === 0) return;
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const nextBanner = () => {
    if (isTransitioning || banners.length === 0) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
      setIsTransitioning(false);
    }, 300);
  };

  const prevBanner = () => {
    if (isTransitioning || banners.length === 0) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
      setIsTransitioning(false);
    }, 300);
  };

  const goToBanner = (index) => {
    if (isTransitioning || index === currentBanner || banners.length === 0) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentBanner(index);
      setIsTransitioning(false);
    }, 300);
  };

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

  const displayBanners = banners.length > 0 ? banners : [
    { id: 1, image: `${BASE_URL}/uploads/banners/1778596224_banner_15.webp`, title: 'MENS LUXURY', subtitle: 'Discover the art of fine craftsmanship', button_text: 'Shop Rings' },
    { id: 2, image: `${BASE_URL}/uploads/banners/1778595454_banner_4.jpg`, title: 'TUNGSTEN RINGS', subtitle: 'Scratch-resistant | Hypoallergenic', button_text: 'Explore Rings' },
  ];

  const displayFeatures = features.length > 0 ? features : [
    { id: 1, title: 'Free Shipping', description: 'On orders over $500' },
    { id: 2, title: 'Secure Payment', description: '100% secure transactions' },
    { id: 3, title: 'Easy Returns', description: '30-day return policy' },
    { id: 4, title: '24/7 Support', description: 'Dedicated customer care' },
  ];

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      {/* Hero Slider */}
      <section className="relative h-screen overflow-hidden">
        {displayBanners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === currentBanner ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <div className="absolute inset-0 bg-black/40 z-10" />
            <img
              src={banner.image}
              alt={banner.title}
              className="w-full h-full object-contain md:object-cover"
              onError={(e) => e.target.style.display = 'none'}
            />
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4">
              <h1 className="animate-fadeInUp text-white text-5xl md:text-7xl font-bold mb-4 tracking-wider shadow-text">
                {banner.title}
              </h1>
              <p className="animate-fadeInUp animation-delay-200 text-white text-xl md:text-2xl max-w-2xl mb-8 shadow-text">
                {banner.subtitle}
              </p>
              <button className="animate-fadeInUp animation-delay-400 bg-white text-black px-8 py-3 rounded-full font-semibold hover:scale-105 transition-all">
                {banner.button_text || 'Shop Now'}
              </button>
            </div>
          </div>
        ))}
        {displayBanners.length > 0 && (
          <>
            <button onClick={prevBanner} className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/50 text-white hover:bg-black/70">‹</button>
            <button onClick={nextBanner} className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/50 text-white hover:bg-black/70">›</button>
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex gap-2">
              {displayBanners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToBanner(index)}
                  className={`h-1 rounded-full transition-all ${index === currentBanner ? 'w-8 bg-white' : 'w-4 bg-white/30'}`}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Bestsellers */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Bestsellers</h2>
          <div className="w-20 h-px bg-white/20 mx-auto" />
          <p className="text-white/50 mt-4">Our most loved pieces, chosen by men</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestsellers.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Solo Banner */}
      {soloBanner && (
        <section className="relative py-24 px-4 overflow-hidden min-h-[500px] flex items-center justify-center">
          <div className="absolute inset-0">
            <img src={soloBanner.image} alt={soloBanner.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/60" />
          </div>
          <div className="relative z-10 text-center max-w-4xl mx-auto">
            <h2 className="text-white text-4xl md:text-5xl font-bold mb-4">{soloBanner.title}</h2>
            <p className="text-white/80 text-lg mb-8">{soloBanner.subtitle}</p>
            <button className="bg-white text-black px-8 py-3 rounded-full font-semibold hover:scale-105 transition-all">
              {soloBanner.button_text || 'Discover Collection'}
            </button>
          </div>
        </section>
      )}

      {/* New Arrivals */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">New Arrivals</h2>
          <div className="w-20 h-px bg-white/20 mx-auto" />
          <p className="text-white/50 mt-4">Fresh drops for the modern gentleman</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newArrivals.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">What Our Customers Say</h2>
          <div className="w-20 h-px bg-white/20 mx-auto" />
          <p className="text-white/50 mt-4">Join thousands of satisfied customers</p>
        </div>

        <div className="relative">
          {testimonials.length > 0 ? (
            testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className={`transition-all duration-700 ease-in-out ${
                  index === currentTestimonial ? 'opacity-100 block' : 'hidden opacity-0'
                }`}
              >
                <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-8 md:p-12 border border-white/10 shadow-2xl">
                  <div className="flex justify-center mb-6">
                    <div className="flex gap-1">
                      {[...Array(testimonial.rating || 5)].map((_, i) => (
                        <svg key={i} className="w-6 h-6 text-yellow-500 fill-current" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <p className="text-xl md:text-2xl text-white/80 text-center italic mb-8">
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    <div>
                      <h4 className="text-white font-semibold">{testimonial.name}</h4>
                      <p className="text-white/40 text-sm">{testimonial.role || 'Verified Buyer'}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-white/40">No testimonials yet. Be the first to share your experience!</p>
            </div>
          )}

          {testimonials.length > 0 && (
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`h-1 rounded-full transition-all ${index === currentTestimonial ? 'w-8 bg-white' : 'w-4 bg-white/30'}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Add Your Feedback Button */}
        <div className="text-center mt-12">
          <button
            onClick={() => setShowFeedbackModal(true)}
            className="px-6 py-3 bg-white/10 border border-white/20 rounded-full text-white hover:bg-white/20 transition-all duration-300 flex items-center gap-2 mx-auto"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Add Your Feedback
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          {displayFeatures.map((feature) => (
            <div key={feature.id} className="text-center group">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-all">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
              <p className="text-white/40 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter - Fixed with API integration */}
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
              className="px-8 py-3 bg-white text-black rounded-xl font-semibold hover:bg-gray-200 transition-all disabled:opacity-50"
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

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl max-w-md w-full p-6 relative border border-white/10">
            <button
              onClick={() => {
                setShowFeedbackModal(false);
                setSubmitSuccess(false);
                setSubmitMessage('');
              }}
              className="absolute top-4 right-4 text-white/40 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-2xl font-bold text-white mb-2 text-center">Share Your Experience</h2>
            <p className="text-white/40 text-center mb-6">Your feedback helps us serve you better</p>

            {submitSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-white text-lg">{submitMessage}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitFeedback} className="space-y-4">
                <div>
                  <label className="block text-white/70 text-sm mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={feedbackData.name}
                    onChange={(e) => setFeedbackData({...feedbackData, name: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl bg-gray-800 text-white border border-white/10 focus:border-white/30 focus:outline-none"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-1">Your Role (Optional)</label>
                  <input
                    type="text"
                    value={feedbackData.role}
                    onChange={(e) => setFeedbackData({...feedbackData, role: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl bg-gray-800 text-white border border-white/10 focus:border-white/30 focus:outline-none"
                    placeholder="Customer, Collector, etc."
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">Your Rating *</label>
                  <StarRating 
                    rating={feedbackData.rating} 
                    onRatingChange={(rating) => setFeedbackData({...feedbackData, rating})}
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-1">Your Feedback *</label>
                  <textarea
                    required
                    rows={4}
                    value={feedbackData.text}
                    onChange={(e) => setFeedbackData({...feedbackData, text: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl bg-gray-800 text-white border border-white/10 focus:border-white/30 focus:outline-none resize-none"
                    placeholder="Share your experience with our products... (minimum 5 characters)"
                  />
                  <p className="text-white/30 text-xs mt-1">Minimum 5 characters required</p>
                </div>

                {submitMessage && !submitSuccess && (
                  <p className="text-red-400 text-sm text-center">{submitMessage}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-white text-black rounded-xl font-semibold hover:bg-gray-200 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default Home;