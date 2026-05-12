import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';

const API_URL = 'http://127.0.0.1:8000/api/admin';
const BASE_URL = 'http://127.0.0.1:8000';

function AdminAboutCta() {
  const [cta, setCta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    image: '',
    title: '',
    subtitle: '',
    button_text: '',
    button_link: '',
    active: 1
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    fetchCta();
  }, []);

  const fetchCta = async () => {
    try {
      console.log('Fetching CTA...');
      const response = await fetch(`${API_URL}/about-cta`);
      const result = await response.json();
      
      if (result.success && result.data) {
        setCta(result.data);
        setFormData({
          image: result.data.image || '',
          title: result.data.title || '',
          subtitle: result.data.subtitle || '',
          button_text: result.data.button_text || '',
          button_link: result.data.button_link || '',
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
    submitData.append('subtitle', formData.subtitle);
    submitData.append('button_text', formData.button_text);
    submitData.append('button_link', formData.button_link);
    submitData.append('active', formData.active);
    submitData.append('_method', 'PUT');
    
    if (imageFile) {
      submitData.append('image', imageFile);
    }

    try {
      const url = cta ? `${API_URL}/about-cta/${cta.id}` : `${API_URL}/about-cta/1`;
      
      const response = await fetch(url, {
        method: 'POST',
        body: submitData
      });
      
      const result = await response.json();
      
      if (result.success) {
        await fetchCta();
        setEditing(false);
        setImageFile(null);
        alert('CTA saved successfully!');
      } else {
        alert(result.message || 'Error saving CTA');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error saving CTA');
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
          <h1 className="text-2xl font-bold text-white">About CTA (Call to Action)</h1>
          <button
            onClick={() => {
              setEditing(!editing);
              if (!editing && cta) {
                setFormData({
                  image: cta.image,
                  title: cta.title,
                  subtitle: cta.subtitle,
                  button_text: cta.button_text,
                  button_link: cta.button_link,
                  active: cta.active
                });
                setImagePreview(`${BASE_URL}${cta.image}`);
                setImageFile(null);
              }
            }}
            className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-all"
            disabled={saving}
          >
            {editing ? 'Cancel' : 'Edit CTA'}
          </button>
        </div>

        {!editing && cta ? (
          // View Mode
          <div className="bg-gray-900 rounded-xl p-6">
            <div className="mb-6">
              <img 
                src={imagePreview || `${BASE_URL}${cta.image}`} 
                alt={cta.title}
                className="w-full h-64 object-cover rounded-lg"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/800x400?text=No+Image';
                }}
              />
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-white">{cta.title}</h2>
              <p className="text-gray-300 leading-relaxed">{cta.subtitle}</p>
              <div className="flex gap-4">
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                  Button: {cta.button_text}
                </span>
                <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                  Link: {cta.button_link}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm ${cta.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {cta.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          // Edit Mode
          <form onSubmit={handleSubmit} className="bg-gray-900 rounded-xl p-6 space-y-4">
            <div>
              <label className="block text-white mb-2">Background Image</label>
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
                placeholder="e.g., Ready to Elevate Your Style?"
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
                placeholder="Enter description text..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white mb-2">Button Text</label>
                <input
                  type="text"
                  value={formData.button_text}
                  onChange={(e) => setFormData({...formData, button_text: e.target.value})}
                  className="w-full p-2 rounded bg-gray-800 text-white border border-white/10"
                  required
                  placeholder="e.g., Shop Now"
                />
              </div>
              <div>
                <label className="block text-white mb-2">Button Link</label>
                <input
                  type="text"
                  value={formData.button_link}
                  onChange={(e) => setFormData({...formData, button_link: e.target.value})}
                  className="w-full p-2 rounded bg-gray-800 text-white border border-white/10"
                  required
                  placeholder="e.g., /shop"
                />
              </div>
            </div>

            <div>
              <label className="block text-white mb-2">Status</label>
              <select
                value={formData.active}
                onChange={(e) => setFormData({...formData, active: parseInt(e.target.value)})}
                className="w-full p-2 rounded bg-gray-800 text-white border border-white/10"
              >
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
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
                {saving ? 'Saving...' : 'Save CTA'}
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

export default AdminAboutCta;