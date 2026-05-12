import { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const API_URL = 'http://127.0.0.1:8000/api';
const BASE_URL = 'http://127.0.0.1:8000';

function Blog() {
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [featuredPost, setFeaturedPost] = useState(null);
  const [blogHero, setBlogHero] = useState(null);

  // Fetch posts, categories, featured post, and blog hero
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch all posts
      const postsRes = await fetch(`${API_URL}/blog-posts`);
      const postsResult = await postsRes.json();
      
      // Fetch categories
      const catsRes = await fetch(`${API_URL}/blog-categories`);
      const catsResult = await catsRes.json();
      
      // Fetch featured post
      const featuredRes = await fetch(`${API_URL}/blog-posts/featured`);
      const featuredResult = await featuredRes.json();
      
      // Fetch blog hero
      const heroRes = await fetch(`${API_URL}/blog-hero`);
      const heroResult = await heroRes.json();
      
      if (postsResult.success) {
        setPosts(postsResult.data);
      }
      
      if (catsResult.success) {
        setCategories(catsResult.data);
      }
      
      if (featuredResult.success && featuredResult.data) {
        setFeaturedPost(featuredResult.data);
      }
      
      if (heroResult.success && heroResult.data) {
        setBlogHero({
          ...heroResult.data,
          image: `${BASE_URL}${heroResult.data.image}`
        });
      }
    } catch (error) {
      console.error('Error fetching blog data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter posts based on category and search
  const filteredPosts = posts.filter(post => {
    const matchesCategory = activeCategory === 'All' || post.category === activeCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (post.excerpt && post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
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

      {/* Hero Section - Dynamic from blog_hero table */}
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={blogHero?.image || `${BASE_URL}/images/15.webp`}
            alt={blogHero?.title || 'Blog'}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('Blog hero image failed to load:', blogHero?.image);
              e.target.src = `${BASE_URL}/images/15.webp`;
            }}
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-wider" style={{ color: 'white' }}>
            {blogHero?.title || 'Our Blog'}
          </h1>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            {blogHero?.subtitle || 'Insights, stories, and inspiration from the world of luxury'}
          </p>
          <div className="w-24 h-px bg-white/20 mx-auto mt-8" />
        </div>
      </section>

      {/* Search and Categories */}
      <section className="py-8 px-4 border-b border-white/10 sticky top-16 bg-black/95 backdrop-blur-sm z-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    activeCategory === cat
                      ? 'bg-white text-black'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                  style={activeCategory !== cat ? { color: 'rgba(255, 255, 255, 0.7)' } : {}}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 bg-white/10 border border-white/20 rounded-full px-4 py-2 pl-10 text-sm focus:outline-none focus:border-white/40"
                style={{ color: 'white' }}
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {activeCategory === 'All' && searchTerm === '' && featuredPost && (
        <section className="py-12 px-4 max-w-7xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden group">
            <div className="absolute inset-0">
              <img
                src={`${BASE_URL}${featuredPost.image}`}
                alt={featuredPost.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = `${BASE_URL}/images/15.webp`;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
            </div>
            <div className="relative z-10 p-8 md:p-12 max-w-2xl">
              <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs mb-4">
                Featured • {featuredPost.category}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">{featuredPost.title}</h2>
              <p className="text-white/70 mb-4 line-clamp-2">{featuredPost.excerpt}</p>
              <div className="flex items-center gap-4 text-white/50 text-sm mb-6">
                <span>{new Date(featuredPost.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <span>•</span>
                <span>{featuredPost.read_time || '5 min read'}</span>
              </div>
              <button className="px-6 py-2 bg-white text-black rounded-full font-semibold hover:bg-gray-200 transition-all hover:scale-105">
                Read Article →
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Blog Grid */}
      <section className="py-12 px-4 max-w-7xl mx-auto">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/60 text-lg">No posts found.</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <p className="text-white/40 text-sm">
                Showing <span className="text-white">{filteredPosts.length}</span> articles
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className="group rounded-xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 bg-black"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={`${BASE_URL}${post.image}`}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        e.target.src = `${BASE_URL}/images/15.webp`;
                      }}
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded text-white text-xs">
                        {post.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-3 text-white/40 text-xs mb-3">
                      <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span>•</span>
                      <span>{post.read_time || '5 min read'}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2 line-clamp-2 group-hover:text-white/90 transition">
                      {post.title}
                    </h3>
                    <p className="text-white/50 text-sm leading-relaxed line-clamp-3 mb-4">
                      {post.excerpt}
                    </p>
                    <button className="text-white/70 hover:text-white text-sm font-medium inline-flex items-center gap-1 transition-colors">
                      Read More
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
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
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 bg-white/5 border border-white/20 rounded-xl px-5 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white/50"
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

export default Blog;