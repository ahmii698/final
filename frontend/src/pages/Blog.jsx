import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const API_URL = 'http://127.0.0.1:8000/api';
const BASE_URL = 'http://127.0.0.1:8000';

function Blog() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [posts, setPosts] = useState([]);
  const [featuredPost, setFeaturedPost] = useState(null);
  const [blogHero, setBlogHero] = useState(null);

  // Fetch posts, featured post, and blog hero
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch all posts
      const postsRes = await fetch(`${API_URL}/blog-posts`);
      const postsResult = await postsRes.json();
      
      // Fetch featured post from blog_featured table
      const featuredRes = await fetch(`${API_URL}/blog-featured-front`);
      const featuredResult = await featuredRes.json();
      
      // Fetch blog hero
      const heroRes = await fetch(`${API_URL}/blog-hero`);
      const heroResult = await heroRes.json();
      
      if (postsResult.success) {
        setPosts(postsResult.data);
      }
      
      if (featuredResult.success && featuredResult.data) {
        setFeaturedPost({
          ...featuredResult.data,
          image: `${BASE_URL}${featuredResult.data.image}`
        });
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

  const handlePostClick = (slug) => {
    navigate(`/blog/${slug}`);
  };

  // Filter posts based on search only
  const filteredPosts = posts.filter(post => {
    const matchesSearch = searchTerm === '' || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.excerpt && post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (post.category && post.category.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
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
            className="w-full h-full object-cover object-center"
            onError={(e) => {
              console.error('Blog hero image failed to load:', blogHero?.image);
              e.target.src = `${BASE_URL}/images/15.webp`;
            }}
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-wider drop-shadow-lg" style={{ color: 'white' }}>
            {blogHero?.title || 'Our Blog'}
          </h1>
          <p className="text-xl max-w-2xl mx-auto drop-shadow" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            {blogHero?.subtitle || 'Insights, stories, and inspiration from the world of luxury'}
          </p>
          <div className="w-24 h-px bg-white/20 mx-auto mt-8" />
        </div>
      </section>

      {/* Search Only Section */}
      <section className="py-8 px-4 border-b border-white/10 sticky top-16 bg-black/95 backdrop-blur-sm z-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-end">
            <div className="relative">
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-72 bg-white/10 border border-white/20 rounded-full px-4 py-2 pl-10 text-sm focus:outline-none focus:border-white/40 text-white"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Post - Like ProductCard style */}
      {searchTerm === '' && featuredPost && featuredPost.active === 1 && (
        <section className="py-12 px-4 max-w-7xl mx-auto">
          <div 
            onClick={() => window.location.href = featuredPost.link || '#'}
            className="relative rounded-2xl overflow-hidden group cursor-pointer"
          >
            <div className="absolute inset-0">
              <img
                src={featuredPost.image}
                alt={featuredPost.title}
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                onError={(e) => {
                  e.target.src = `${BASE_URL}/images/15.webp`;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
            </div>
            <div className="relative z-10 p-8 md:p-12 max-w-2xl">
              <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs mb-4">
                Featured
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 drop-shadow-lg">{featuredPost.title}</h2>
              <p className="text-white/70 mb-4 line-clamp-2 drop-shadow">{featuredPost.excerpt}</p>
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

      {/* Blog Grid - Same as ProductCard style */}
      <section className="py-12 px-4 max-w-7xl mx-auto">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/60 text-lg">No posts found matching your search.</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <p className="text-white/40 text-sm">
                Showing <span className="text-white">{filteredPosts.length}</span> articles
                {searchTerm && <span className="ml-2">for "{searchTerm}"</span>}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => handlePostClick(post.slug)}
                  className="group bg-gradient-to-br from-gray-900 to-black rounded-xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer"
                >
                  {/* Image Container - Same as ProductCard */}
                  <div className="relative h-64 overflow-hidden bg-gray-800">
                    <img
                      src={`${BASE_URL}${post.image}`}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                      }}
                    />
                    {/* Optional: Category badge on image */}
                    {post.category && (
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded text-white text-xs">
                          {post.category}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Content - Same as ProductCard info section */}
                  <div className="p-4">
                    {/* Date and Read Time */}
                    <div className="flex items-center gap-3 text-white/40 text-xs mb-2">
                      <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span>•</span>
                      <span>{post.read_time || '5 min read'}</span>
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-white/90 transition">
                      {post.title}
                    </h3>
                    
                    {/* Excerpt */}
                    <p className="text-white/50 text-sm leading-relaxed line-clamp-2 mb-3">
                      {post.excerpt}
                    </p>
                    
                    {/* Read More link */}
                    <div className="text-white/70 hover:text-white text-sm font-medium inline-flex items-center gap-1 transition-colors">
                      Read More
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
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