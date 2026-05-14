import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

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

function Blog() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
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
      toast.error('Failed to load blog posts!', toastConfig);
    } finally {
      setLoading(false);
    }
  };

  const handlePostClick = (slug) => {
    navigate(`/blog/${slug}`);
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

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[40vh] md:h-[45vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={blogHero?.image || `${BASE_URL}/images/15.webp`}
            alt={blogHero?.title || 'Blog'}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = `${BASE_URL}/images/15.webp`;
            }}
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-3 tracking-wider" style={{ color: 'white' }}>
            {blogHero?.title || 'Our Blog'}
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            {blogHero?.subtitle || 'Insights, stories, and inspiration from the world of luxury'}
          </p>
          <div className="w-20 h-px bg-white/20 mx-auto mt-6" />
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && featuredPost.active === 1 && (
        <section className="py-12 px-4 max-w-7xl mx-auto">
          <div 
            onClick={() => handlePostClick(featuredPost.slug || featuredPost.link)}
            className="relative rounded-2xl overflow-hidden group cursor-pointer"
          >
            <div className="absolute inset-0">
              <img
                src={featuredPost.image}
                alt={featuredPost.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
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

      {/* Blog Grid - No Search, No Categories */}
      <section className="py-12 px-4 max-w-7xl mx-auto">
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/60 text-lg">No posts found.</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <p className="text-white/40 text-sm">
                Showing <span className="text-white">{posts.length}</span> articles
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => handlePostClick(post.slug)}
                  className="group bg-gradient-to-br from-gray-900 to-black rounded-xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer hover:-translate-y-1"
                >
                  <div className="relative h-64 overflow-hidden bg-gray-800">
                    <img
                      src={`${BASE_URL}${post.image}`}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'300\' viewBox=\'0 0 400 300\'%3E%3Crect width=\'400\' height=\'300\' fill=\'%23333333\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' dy=\'.3em\' fill=\'%23666666\' font-size=\'14\'%3ENo Image%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-center gap-3 text-white/40 text-xs mb-2">
                      <span>{new Date(post.created_at || post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span>•</span>
                      <span>{post.read_time || '5 min read'}</span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-white/90 transition">
                      {post.title}
                    </h3>
                    
                    <p className="text-white/50 text-sm leading-relaxed line-clamp-2 mb-3">
                      {post.excerpt}
                    </p>
                    
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
      <ToastContainer />
    </div>
  );
}

export default Blog;