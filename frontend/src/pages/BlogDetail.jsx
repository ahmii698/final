import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

function BlogDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState(null);
  const [recentPosts, setRecentPosts] = useState([]);

  useEffect(() => {
    fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    try {
      // First try to fetch all posts and find by slug (fallback method)
      const allPostsRes = await fetch(`${API_URL}/blog-posts`);
      const allPostsResult = await allPostsRes.json();
      
      if (allPostsResult.success) {
        const foundPost = allPostsResult.data.find(p => p.slug === slug);
        if (foundPost) {
          setPost({
            ...foundPost,
            image: `${BASE_URL}${foundPost.image}`
          });
        } else {
          toast.error('Post not found!', toastConfig);
          navigate('/blog');
        }
      }
      
      // Get recent posts (excluding current)
      const recentRes = await fetch(`${API_URL}/blog-posts`);
      const recentResult = await recentRes.json();
      if (recentResult.success) {
        setRecentPosts(recentResult.data.filter(p => p.slug !== slug).slice(0, 3));
      }
      
    } catch (error) {
      console.error('Error fetching post:', error);
      toast.error('Failed to load post!', toastConfig);
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
        <ToastContainer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-white text-xl">Post not found</div>
        </div>
        <Footer />
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      {/* Blog Detail - Left Image, Right Content */}
      <section className="py-12 px-4 max-w-7xl mx-auto">
        <button
          onClick={() => navigate('/blog')}
          className="mb-6 flex items-center gap-2 text-white/60 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Blog
        </button>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Side - Image */}
          <div className="rounded-2xl overflow-hidden bg-gray-800 sticky top-24">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-auto object-cover"
              onError={(e) => {
                e.target.src = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'600\' height=\'400\' viewBox=\'0 0 600 400\'%3E%3Crect width=\'600\' height=\'400\' fill=\'%23333333\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' dy=\'.3em\' fill=\'%23666666\' font-size=\'16\'%3ENo Image%3C/text%3E%3C/svg%3E';
              }}
            />
          </div>

          {/* Right Side - Content */}
          <div>
            {/* Meta info */}
            <div className="flex items-center gap-3 text-white/40 text-sm mb-4">
              <span>{new Date(post.created_at || post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              <span>•</span>
              <span>{post.read_time || '5 min read'}</span>
            </div>
            
            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              {post.title}
            </h1>
            
            {/* Content */}
            <div className="prose prose-invert max-w-none">
              <p className="text-white/70 text-lg leading-relaxed mb-4">
                {post.content || post.excerpt || 'No content available for this post.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Posts */}
      {recentPosts.length > 0 && (
        <section className="py-12 px-4 max-w-7xl mx-auto border-t border-white/10">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Recent Posts</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentPosts.map((recent) => (
              <div
                key={recent.id}
                onClick={() => navigate(`/blog/${recent.slug}`)}
                className="group bg-gradient-to-br from-gray-900 to-black rounded-xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={`${BASE_URL}${recent.image}`}
                    alt={recent.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'300\' viewBox=\'0 0 400 300\'%3E%3Crect width=\'400\' height=\'300\' fill=\'%23333333\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' dy=\'.3em\' fill=\'%23666666\' font-size=\'14\'%3ENo Image%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-white font-semibold line-clamp-1 group-hover:text-white/90">
                    {recent.title}
                  </h3>
                  <p className="text-white/40 text-sm mt-1">
                    {new Date(recent.created_at || recent.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <Footer />
      <ToastContainer />
    </div>
  );
}

export default BlogDetail;