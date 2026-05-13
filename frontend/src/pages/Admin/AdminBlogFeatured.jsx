import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';

const API_URL = 'http://127.0.0.1:8000/api/admin';
const BASE_URL = 'http://127.0.0.1:8000';

function AdminBlogFeatured() {
  const [featured, setFeatured] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    image: '',
    title: '',
    excerpt: '',
    date: '',
    read_time: '',
    link: '',
    active: 1
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    fetchFeatured();
  }, []);

  const fetchFeatured = async () => {
    try {
      const response = await fetch(`${API_URL}/blog-featured`);
      const result = await response.json();
      
      if (result.success && result.data) {
        setFeatured(result.data);
        setFormData({
          image: result.data.image || '',
          title: result.data.title || '',
          excerpt: result.data.excerpt || '',
          date: result.data.date || '',
          read_time: result.data.read_time || '',
          link: result.data.link || '',
          active: result.data.active || 1
        });
        if (result.data.image) {
          setImagePreview(`${BASE_URL}${result.data.image}`);
        }
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
    submitData.append('excerpt', formData.excerpt);
    submitData.append('date', formData.date);
    submitData.append('read_time', formData.read_time);
    submitData.append('link', formData.link);
    submitData.append('active', formData.active);
    submitData.append('_method', 'PUT');
    
    if (imageFile) {
      submitData.append('image', imageFile);
    }

    try {
      const url = featured ? `${API_URL}/blog-featured/${featured.id}` : `${API_URL}/blog-featured/1`;
      
      const response = await fetch(url, {
        method: 'POST',
        body: submitData
      });
      
      const result = await response.json();
      
      if (result.success) {
        await fetchFeatured();
        setEditing(false);
        setImageFile(null);
        alert('Featured post saved successfully!');
      } else {
        alert(result.message || 'Error saving featured post');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error saving featured post');
    } finally {
      setSaving(false);
    }
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
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Blog Featured Post</h1>
          <button
            onClick={() => setEditing(!editing)}
            className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-all"
            disabled={saving}
          >
            {editing ? 'Cancel' : 'Edit Featured'}
          </button>
        </div>

        {!editing && featured ? (
          // View Mode
          <div className="bg-gray-900 rounded-xl p-6">
            <div className="mb-6">
              <img 
                src={imagePreview || `${BASE_URL}${featured.image}`} 
                alt={featured.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-white">{featured.title}</h2>
              <p className="text-gray-300 leading-relaxed">{featured.excerpt}</p>
              <div className="flex gap-4">
                <span className="text-white/50 text-sm">📅 {new Date(featured.date).toLocaleDateString()}</span>
                <span className="text-white/50 text-sm">⏱️ {featured.read_time}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${featured.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {featured.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          // Edit Mode
          <form onSubmit={handleSubmit} className="bg-gray-900 rounded-xl p-6 space-y-4">
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
            </div>

            <div>
              <label className="block text-white mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full p-2 rounded bg-gray-800 text-white border border-white/10"
                required
              />
            </div>

            <div>
              <label className="block text-white mb-2">Excerpt / Description</label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                rows="4"
                className="w-full p-2 rounded bg-gray-800 text-white border border-white/10"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white mb-2">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full p-2 rounded bg-gray-800 text-white border border-white/10"
                  required
                />
              </div>
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
            </div>

            <div>
              <label className="block text-white mb-2">Link URL</label>
              <input
                type="text"
                value={formData.link}
                onChange={(e) => setFormData({...formData, link: e.target.value})}
                className="w-full p-2 rounded bg-gray-800 text-white border border-white/10"
                placeholder="/blog/how-to-choose-perfect-ring"
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
                {saving ? 'Saving...' : 'Save Featured Post'}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminBlogFeatured;