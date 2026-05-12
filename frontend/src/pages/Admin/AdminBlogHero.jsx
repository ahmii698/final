import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';

const API_URL = 'http://127.0.0.1:8000/api/admin';
const BASE_URL = 'http://127.0.0.1:8000';

function AdminBlogHero() {
  // Same as AdminShopHero but with different defaults
  const [hero, setHero] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    image: '',
    title: '',
    subtitle: '',
    active: 1
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    fetchHero();
  }, []);

  const fetchHero = async () => {
    try {
      const response = await fetch(`${API_URL}/blog-hero`);
      const result = await response.json();
      
      if (result.success && result.data) {
        setHero(result.data);
        setFormData({
          image: result.data.image || '',
          title: result.data.title || 'Our Blog',
          subtitle: result.data.subtitle || 'Latest trends, tips and stories from LUXE',
          active: result.data.active || 1
        });
        if (result.data.image) {
          setImagePreview(`${BASE_URL}${result.data.image}`);
        }
      } else {
        setFormData({
          image: '',
          title: 'Our Blog',
          subtitle: 'Latest trends, tips and stories from LUXE',
          active: 1
        });
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
    submitData.append('subtitle', formData.subtitle);
    submitData.append('active', formData.active);
    submitData.append('_method', 'PUT');
    
    if (imageFile) {
      submitData.append('image', imageFile);
    }

    try {
      const url = hero ? `${API_URL}/blog-hero/${hero.id}` : `${API_URL}/blog-hero/1`;
      
      const response = await fetch(url, {
        method: 'POST',
        body: submitData
      });
      
      const result = await response.json();
      
      if (result.success) {
        await fetchHero();
        setEditing(false);
        setImageFile(null);
        alert('Blog Hero saved successfully!');
      } else {
        alert(result.message || 'Error saving hero');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error saving hero');
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
          <h1 className="text-2xl font-bold text-white">Blog Page Hero Section</h1>
          <button
            onClick={() => {
              setEditing(!editing);
              if (!editing && hero) {
                setFormData({
                  image: hero.image,
                  title: hero.title,
                  subtitle: hero.subtitle,
                  active: hero.active
                });
                setImagePreview(`${BASE_URL}${hero.image}`);
                setImageFile(null);
              }
            }}
            className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-all"
            disabled={saving}
          >
            {editing ? 'Cancel' : 'Edit Hero'}
          </button>
        </div>

        {!editing && hero ? (
          <div className="bg-gray-900 rounded-xl p-6">
            <div className="mb-6">
              <img 
                src={imagePreview || `${BASE_URL}${hero.image}`} 
                alt={hero.title}
                className="w-full h-64 object-cover rounded-lg"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/800x400?text=Blog+Hero';
                }}
              />
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-white">{hero.title}</h2>
              <p className="text-gray-300 leading-relaxed text-lg">{hero.subtitle}</p>
              <div className="pt-4">
                <span className={`px-3 py-1 rounded-full text-sm ${hero.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {hero.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-gray-900 rounded-xl p-6 space-y-4">
            <div>
              <label className="block text-white mb-2">Hero Background Image</label>
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
              <label className="block text-white mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full p-2 rounded bg-gray-800 text-white border border-white/10"
                required
                placeholder="e.g., Our Blog"
              />
            </div>

            <div>
              <label className="block text-white mb-2">Subtitle / Description</label>
              <textarea
                value={formData.subtitle}
                onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                rows="3"
                className="w-full p-2 rounded bg-gray-800 text-white border border-white/10"
                required
                placeholder="e.g., Latest trends, tips and stories from LUXE"
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
                  saving 
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {saving ? 'Saving...' : 'Save Hero'}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                disabled={saving}
                className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
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

export default AdminBlogHero;