import { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const API_URL = 'http://localhost:8000/api';  // ← CHANGE THIS
const BASE_URL = 'http://localhost:8000';      // ← CHANGE THIS

function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  
  // Hero section state
  const [heroData, setHeroData] = useState(null);

  // Check for theme
  useEffect(() => {
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains('dark') || 
                     document.body.classList.contains('dark') ||
                     localStorage.getItem('theme') === 'dark';
      setIsDarkTheme(isDark);
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    window.addEventListener('storage', checkTheme);

    return () => {
      observer.disconnect();
      window.removeEventListener('storage', checkTheme);
    };
  }, []);

  // Fetch FAQs and Hero from database
  useEffect(() => {
    fetchContactData();
  }, []);

  const fetchContactData = async () => {
    try {
      // Fetch FAQs
      const faqResponse = await fetch(`${API_URL}/faqs`);
      const faqResult = await faqResponse.json();
      
      if (faqResult.success) {
        setFaqs(faqResult.data);
      }
      
      // Fetch Contact Hero
      const heroResponse = await fetch(`${API_URL}/contact-hero`);
      const heroResult = await heroResponse.json();
      
      if (heroResult.success && heroResult.data) {
        setHeroData({
          ...heroResult.data,
          image: `${BASE_URL}${heroResult.data.image}`
        });
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${API_URL}/contact-submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('Message sent! We will get back to you soon.');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        alert(result.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkTheme ? 'bg-black' : 'bg-gray-50'}`}>
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className={isDarkTheme ? 'text-white' : 'text-gray-900'}>Loading...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkTheme ? 'bg-black' : 'bg-gray-50'}`}>
      <Navbar />

      {/* Hero Section - Dynamic from Database */}
      <section className="relative h-[45vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroData?.image || `${BASE_URL}/images/15.webp`}
            alt={heroData?.title || 'Contact Us'}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('Hero image failed:', heroData?.image);
              e.target.src = `${BASE_URL}/images/15.webp`;
            }}
          />
          <div className={`absolute inset-0 ${isDarkTheme ? 'bg-black/60' : 'bg-black/40'}`} />
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-wider" style={{ color: 'white' }}>
            {heroData?.title || 'Contact Us'}
          </h1>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            {heroData?.subtitle || "We'd love to hear from you. Get in touch with our team"}
          </p>
          <div className={`w-24 h-px bg-white/20 mx-auto mt-8`} />
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-12 px-4 max-w-4xl mx-auto">
        <div className={`${isDarkTheme ? 'bg-black border-white/10' : 'bg-white border-gray-200'} rounded-2xl border p-6 md:p-8`}>
          <h2 className={`text-2xl md:text-3xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-900'} mb-2 text-center`}>
            Send us a Message
          </h2>
          <p className={`${isDarkTheme ? 'text-white/50' : 'text-gray-500'} text-sm mb-6 text-center`}>
            Fill out the form below and we'll get back to you
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl mx-auto">
            <div className="grid sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Your Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full ${isDarkTheme ? 'bg-white/5 border-white/20 text-white placeholder-white/40' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'} border rounded-xl px-5 py-3 focus:outline-none transition-colors`}
                required
              />
              <input
                type="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full ${isDarkTheme ? 'bg-white/5 border-white/20 text-white placeholder-white/40' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'} border rounded-xl px-5 py-3 focus:outline-none transition-colors`}
                required
              />
            </div>
            <input
              type="text"
              placeholder="Subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className={`w-full ${isDarkTheme ? 'bg-white/5 border-white/20 text-white placeholder-white/40' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'} border rounded-xl px-5 py-3 focus:outline-none transition-colors`}
            />
            <textarea
              placeholder="Your Message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={5}
              className={`w-full ${isDarkTheme ? 'bg-white/5 border-white/20 text-white placeholder-white/40' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'} border rounded-xl px-5 py-3 focus:outline-none transition-colors resize-none`}
              required
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-white text-black rounded-xl font-semibold hover:bg-gray-200 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </section>

      {/* FAQ Section - Dynamic from Database */}
      <section className={`py-16 px-4 max-w-4xl mx-auto border-t ${isDarkTheme ? 'border-white/10' : 'border-gray-200'}`}>
        <div className="text-center mb-12">
          <h2 className={`text-3xl md:text-4xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-900'} mb-2`}>
            Frequently Asked Questions
          </h2>
          <div className={`w-20 h-px ${isDarkTheme ? 'bg-white/20' : 'bg-gray-300'} mx-auto`} />
          <p className={`${isDarkTheme ? 'text-white/50' : 'text-gray-500'} mt-4`}>
            Quick answers to common questions
          </p>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={faq.id || index} className={`border ${isDarkTheme ? 'border-white/10 bg-black' : 'border-gray-200 bg-white'} rounded-xl overflow-hidden`}>
              <button
                onClick={() => toggleFaq(index)}
                className={`w-full px-6 py-4 text-left flex justify-between items-center ${isDarkTheme ? 'hover:bg-white/5' : 'hover:bg-gray-50'} transition-colors`}
              >
                <span className={`${isDarkTheme ? 'text-white' : 'text-gray-900'} font-semibold`}>{faq.question}</span>
                <svg 
                  className={`w-5 h-5 ${isDarkTheme ? 'text-white/50' : 'text-gray-500'} transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div 
                className={`px-6 overflow-hidden transition-all duration-300 ${
                  openFaq === index ? 'max-h-40 pb-4' : 'max-h-0'
                }`}
              >
                <p className={`${isDarkTheme ? 'text-white/50' : 'text-gray-500'} text-sm`}>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className={`py-20 px-4 border-t ${isDarkTheme ? 'border-white/10' : 'border-gray-200'}`}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className={`text-3xl md:text-4xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-900'} mb-4`}>
            Join Our Newsletter
          </h2>
          <p className={`${isDarkTheme ? 'text-white/50' : 'text-gray-500'} mb-8`}>
            Subscribe to get exclusive offers and updates
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className={`flex-1 ${isDarkTheme ? 'bg-white/5 border-white/20 text-white placeholder-white/40' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'} border rounded-xl px-5 py-3 focus:outline-none transition-colors`}
            />
            <button className="px-8 py-3 bg-white text-black rounded-xl font-semibold hover:bg-gray-200 transition-all hover:scale-105">
              Subscribe
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Contact;