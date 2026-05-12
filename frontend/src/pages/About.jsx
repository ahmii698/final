import { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const API_URL = 'http://127.0.0.1:8000/api';
const BASE_URL = 'http://127.0.0.1:8000';

function About() {
  const [loading, setLoading] = useState(true);
  const [aboutData, setAboutData] = useState({
    hero: null,
    story: null,
    statistics: [],
    values: [],
    team: [],
    cta: null
  });
  
  // Newsletter states
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false);
  const [newsletterMessage, setNewsletterMessage] = useState('');
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

  useEffect(() => {
    fetchAboutData();
  }, []);

  // Helper function to fix image URLs
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/')) return `${BASE_URL}${imagePath}`;
    return `${BASE_URL}/${imagePath}`;
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

  const fetchAboutData = async () => {
    try {
      const response = await fetch(`${API_URL}/about-data`);
      const result = await response.json();
      
      if (result.success) {
        const fixedHero = result.data.hero ? {
          ...result.data.hero,
          image: getImageUrl(result.data.hero.image)
        } : null;
        
        const fixedStory = result.data.story ? {
          ...result.data.story,
          image: getImageUrl(result.data.story.image)
        } : null;
        
        const fixedTeam = (result.data.team || []).map(member => ({
          ...member,
          image: getImageUrl(member.image)
        }));
        
        const fixedCta = result.data.cta ? {
          ...result.data.cta,
          image: getImageUrl(result.data.cta.image)
        } : null;
        
        setAboutData({
          hero: fixedHero,
          story: fixedStory,
          statistics: result.data.statistics || [],
          values: result.data.values || [],
          team: fixedTeam,
          cta: fixedCta
        });
      }
    } catch (error) {
      console.error('Error fetching about data:', error);
    } finally {
      setLoading(false);
    }
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

  const { hero, story, statistics, values, team, cta } = aboutData;

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      {/* Hero Section */}
      {hero && (
        <section className="relative h-[40vh] md:h-[45vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={hero.image}
              alt={hero.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error('Hero image failed:', hero.image);
                e.target.src = 'https://via.placeholder.com/1920x1080?text=Hero+Image';
              }}
            />
            <div className="absolute inset-0 bg-black/60" />
          </div>
          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-3 tracking-wider" style={{ color: 'white' }}>
              {hero.title}
            </h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              {hero.subtitle}
            </p>
            <div className="w-20 h-px bg-white/20 mx-auto mt-6" />
          </div>
        </section>
      )}

      {/* Our Story Section */}
      {story && (
        <section className="py-20 px-4 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white">{story.heading}</h2>
              <div className="w-16 h-px bg-white/20" />
              {story.paragraph1 && <p className="text-white/60 leading-relaxed">{story.paragraph1}</p>}
              {story.paragraph2 && <p className="text-white/60 leading-relaxed">{story.paragraph2}</p>}
              {story.paragraph3 && <p className="text-white/60 leading-relaxed">{story.paragraph3}</p>}
            </div>
            <div className="relative">
              <img
                src={story.image}
                alt={story.heading}
                className="rounded-xl w-full object-cover shadow-2xl"
                onError={(e) => {
                  console.error('Story image failed:', story.image);
                  e.target.src = 'https://via.placeholder.com/600x400?text=Story+Image';
                }}
              />
            </div>
          </div>
        </section>
      )}

      {/* Stats Section */}
      {statistics.length > 0 && (
        <section className="py-20 px-4 border-t border-white/10 border-b border-white/10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">By the Numbers</h2>
              <div className="w-20 h-px bg-white/20 mx-auto" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {statistics.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.number}</div>
                  <p className="text-white/40 text-sm uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Our Values Section */}
      {values.length > 0 && (
        <section className="py-20 px-4 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Our Values</h2>
            <div className="w-20 h-px bg-white/20 mx-auto" />
            <p className="text-white/50 mt-4 max-w-2xl mx-auto">What makes us different</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center p-6 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 bg-black">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-white font-semibold mb-2">{value.title}</h3>
                <p className="text-white/40 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Team Section */}
      {team.length > 0 && (
        <section className="py-20 px-4 max-w-7xl mx-auto border-t border-white/10 border-b border-white/10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Meet Our Team</h2>
            <div className="w-20 h-px bg-white/20 mx-auto" />
            <p className="text-white/50 mt-4">The masterminds behind LUXE</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <div className="relative w-48 h-48 mx-auto mb-4 rounded-full overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Team image failed:', member.image);
                      e.target.src = 'https://via.placeholder.com/200x200?text=Team';
                    }}
                  />
                </div>
                <h3 className="text-white font-semibold text-xl">{member.name}</h3>
                <p className="text-white/40 text-sm">{member.position}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      {cta && (
        <section className="relative py-24 px-4 overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={cta.image}
              alt={cta.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error('CTA image failed:', cta.image);
                e.target.src = 'https://via.placeholder.com/1920x400?text=CTA';
              }}
            />
            <div className="absolute inset-0 bg-black/70" />
          </div>
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">{cta.title}</h2>
            <p className="text-xl text-white/80 mb-8">{cta.subtitle}</p>
            <button className="px-10 py-4 bg-white text-black rounded-full font-semibold hover:scale-105 transition-all duration-300">
              {cta.button_text || 'Shop Now'}
            </button>
          </div>
        </section>
      )}

      {/* Newsletter Section - ADDED HERE */}
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

      <Footer />
    </div>
  );
}

export default About;