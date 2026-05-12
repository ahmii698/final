import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';

const API_URL = 'http://127.0.0.1:8000/api/admin';
const BASE_URL = 'http://127.0.0.1:8000';

function AdminBlogPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    date: '',
    category: '',
    read_time: '',
    image: '',
    excerpt: '',
    content: '',
    is_featured: 0,
    active: 1
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const categories = ['Rings', 'Watches', 'Chains', 'Bracelets', 'Style', 'Trends', 'Care', 'Education'];

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${API_URL}/blog-posts`);
      const result = await response.json();
      if (result.success) {
        setPosts(result.data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('slug', formData.slug);
    submitData.append('date', formData.date);
    submitData.append('category', formData.category);
    submitData.append('read_time', formData.read_time);
    submitData.append('excerpt', formData.excerpt);
    submitData.append('content', formData.content || '');
    submitData.append('is_featured', formData.is_featured);
    submitData.append('active', formData.active);
    
    if (imageFile) submitData.append('image', imageFile);
    
    if (editingPost) {
      submitData.append('_method', 'PUT');
    }

    try {
      const url = editingPost 
        ? `${API_URL}/blog-posts/${editingPost.id}`
        : `${API_URL}/blog-posts`;
      
      const response = await fetch(url, {
        method: 'POST',
        body: submitData
      });

      const result = await response.json();
      if (result.success) {
        fetchPosts();
        setShowModal(false);
        resetForm();
        alert(editingPost ? 'Post updated!' : 'Post added!');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error saving post');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        const response = await fetch(`${API_URL}/blog-posts/${id}`, {
          method: 'DELETE'
        });
        const result = await response.json();
        if (result.success) {
          fetchPosts();
          alert('Post deleted!');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error deleting post');
      }
    }
  };

  const handleToggleFeatured = async (id, currentStatus) => {
    if (currentStatus === 1) {
      if (!confirm('This will make this post featured. Other featured posts will be unfeatured. Continue?')) return;
    }
    
    try {
      const response = await fetch(`${API_URL}/blog-posts/${id}/featured`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const result = await response.json();
      if (result.success) {
        fetchPosts();
        alert(currentStatus === 1 ? 'Post unfeatured!' : 'Post featured!');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error toggling featured status');
    }
  };

  const resetForm = () => {
    setEditingPost(null);
    setFormData({
      title: '',
      slug: '',
      date: new Date().toISOString().split('T')[0],
      category: '',
      read_time: '',
      image: '',
      excerpt: '',
      content: '',
      is_featured: 0,
      active: 1
    });
    setImageFile(null);
    setImagePreview('');
  };

  const editPost = (post) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug || '',
      date: post.date,
      category: post.category,
      read_time: post.read_time,
      image: post.image || '',
      excerpt: post.excerpt || '',
      content: post.content || '',
      is_featured: post.is_featured || 0,
      active: post.active
    });
    if (post.image) setImagePreview(`${BASE_URL}${post.image}`);
    setShowModal(true);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-white text-center py-10">Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Blog Posts</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-all"
        >
          + Add Post
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-white">
          <thead className="border-b border-white/10">
            <tr className="text-left">
              <th className="p-3">ID</th>
              <th className="p-3">Image</th>
              <th className="p-3">Title</th>
              <th className="p-3">Category</th>
              <th className="p-3">Date</th>
              <th className="p-3">Featured</th>
              <th className="p-3">Active</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-b border-white/10 hover:bg-white/5">
                <td className="p-3">{post.id}</td>
                <td className="p-3">
                  {post.image && (
                    <img 
                      src={`${BASE_URL}${post.image}`} 
                      alt={post.title}
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                </td>
                <td className="p-3 max-w-xs truncate">{post.title}</td>
                <td className="p-3">{post.category}</td>
                <td className="p-3">{post.date}</td>
                <td className="p-3">
                  <button
                    onClick={() => handleToggleFeatured(post.id, post.is_featured)}
                    className={`px-2 py-1 rounded-full text-xs ${post.is_featured ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-500/20 text-gray-400'} hover:opacity-80`}
                  >
                    {post.is_featured ? '★ Featured' : '☆ Set Featured'}
                  </button>
                </td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${post.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {post.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-3">
                  <button onClick={() => editPost(post)} className="text-blue-400 mr-3 hover:text-blue-300">Edit</button>
                  <button onClick={() => handleDelete(post.id)} className="text-red-400 hover:text-red-300">Delete</button>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center py-8 text-white/40">
                  No blog posts added yet. Click "Add Post" to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">{editingPost ? 'Edit' : 'Add'} Blog Post</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white mb-2">Featured Image</label>
                {imagePreview && (
                  <div className="mb-3">
                    <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full p-2 rounded bg-gray-800 text-white border border-white/10"
                />
                <p className="text-gray-400 text-sm mt-1">Leave empty to keep current image</p>
              </div>

              <div>
                <label className="block text-white mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full p-2 rounded bg-gray-800 text-white border border-white/10"
                  required
                  placeholder="Post title"
                />
              </div>

              <div>
                <label className="block text-white mb-2">Slug (URL)</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  className="w-full p-2 rounded bg-gray-800 text-white border border-white/10"
                  placeholder="auto-generated-from-title"
                />
                <p className="text-gray-400 text-sm mt-1">Leave empty to auto-generate from title</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white mb-2">Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full p-2 rounded bg-gray-800 text-white border border-white/10"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full p-2 rounded bg-gray-800 text-white border border-white/10"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white mb-2">Read Time</label>
                  <input
                    type="text"
                    value={formData.read_time}
                    onChange={(e) => setFormData({...formData, read_time: e.target.value})}
                    className="w-full p-2 rounded bg-gray-800 text-white border border-white/10"
                    placeholder="e.g., 5 min read"
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Featured Post</label>
                  <select
                    value={formData.is_featured}
                    onChange={(e) => setFormData({...formData, is_featured: parseInt(e.target.value)})}
                    className="w-full p-2 rounded bg-gray-800 text-white border border-white/10"
                  >
                    <option value={0}>No</option>
                    <option value={1}>Yes (Featured)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-white mb-2">Excerpt / Short Description</label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                  rows="3"
                  className="w-full p-2 rounded bg-gray-800 text-white border border-white/10"
                  placeholder="Short summary of the post..."
                />
              </div>

              <div>
                <label className="block text-white mb-2">Full Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  rows="8"
                  className="w-full p-2 rounded bg-gray-800 text-white border border-white/10"
                  placeholder="Write your blog post content here..."
                />
              </div>

              <div>
                <label className="block text-white mb-2">Status</label>
                <select
                  value={formData.active}
                  onChange={(e) => setFormData({...formData, active: parseInt(e.target.value)})}
                  className="w-full p-2 rounded bg-gray-800 text-white border border-white/10"
                >
                  <option value={1}>Active (Show on Website)</option>
                  <option value={0}>Inactive (Hide on Website)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className={`px-6 py-2 rounded-lg transition-all ${
                    saving ? 'bg-gray-600 text-gray-400' : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {saving ? 'Saving...' : 'Save Post'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminBlogPosts;