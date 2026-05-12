import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';

const API_URL = 'http://127.0.0.1:8000/api/admin';
const BASE_URL = 'http://127.0.0.1:8000';

function AdminSoloBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    button_text: '',
    button_link: '',
    order: 0,
    active: 1
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const response = await fetch(`${API_URL}/solo-banners`);
      const result = await response.json();
      if (result.success) {
        setBanners(result.data);
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
      reader.onloadend = () => setImagePreview(reader.result);
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
    submitData.append('order', formData.order);
    submitData.append('active', formData.active);
    
    if (imageFile) submitData.append('image', imageFile);
    
    if (editingBanner) {
      submitData.append('_method', 'PUT');
    }

    try {
      const url = editingBanner 
        ? `${API_URL}/solo-banners/${editingBanner.id}`
        : `${API_URL}/solo-banners`;
      
      const response = await fetch(url, {
        method: 'POST',
        body: submitData
      });
      
      const result = await response.json();
      if (result.success) {
        fetchBanners();
        setShowModal(false);
        resetForm();
        alert(editingBanner ? 'Banner updated!' : 'Banner added!');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error saving banner');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      try {
        const response = await fetch(`${API_URL}/solo-banners/${id}`, {
          method: 'DELETE'
        });
        const result = await response.json();
        if (result.success) {
          fetchBanners();
          alert('Banner deleted!');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error deleting banner');
      }
    }
  };

  const resetForm = () => {
    setEditingBanner(null);
    setFormData({
      title: '',
      subtitle: '',
      button_text: '',
      button_link: '',
      order: 0,
      active: 1
    });
    setImageFile(null);
    setImagePreview('');
  };

  const editBanner = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle,
      button_text: banner.button_text,
      button_link: banner.button_link,
      order: banner.order || 0,
      active: banner.active
    });
    if (banner.image) setImagePreview(`${BASE_URL}${banner.image}`);
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
        <h1 className="text-2xl font-bold text-white">Solo Banners (Mid Banners)</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-all"
        >
          + Add Banner
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-white">
          <thead className="border-b border-white/10">
            <tr className="text-left">
              <th className="p-3">ID</th>
              <th className="p-3">Image</th>
              <th className="p-3">Title</th>
              <th className="p-3">Button Text</th>
              <th className="p-3">Order</th>
              <th className="p-3">Active</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {banners.map((banner) => (
              <tr key={banner.id} className="border-b border-white/10 hover:bg-white/5">
                <td className="p-3">{banner.id}</td>
                <td className="p-3">
                  {banner.image && (
                    <img 
                      src={`${BASE_URL}${banner.image}`} 
                      alt={banner.title}
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                </td>
                <td className="p-3">{banner.title}</td>
                <td className="p-3">{banner.button_text}</td>
                <td className="p-3">{banner.order}</td>
                <td className="p-3">{banner.active ? '✓' : '✗'}</td>
                <td className="p-3">
                  <button onClick={() => editBanner(banner)} className="text-blue-400 mr-3 hover:text-blue-300">Edit</button>
                  <button onClick={() => handleDelete(banner.id)} className="text-red-400 hover:text-red-300">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">{editingBanner ? 'Edit' : 'Add'} Solo Banner</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white mb-2">Banner Image</label>
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
                  required={!editingBanner}
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
                  placeholder="e.g., LUXURY REDEFINED"
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

              <div className="grid grid-cols-2 gap-3">
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white mb-2">Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})}
                    className="w-full p-2 rounded bg-gray-800 text-white border border-white/10"
                  />
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
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className={`px-6 py-2 rounded-lg transition-all ${
                    saving ? 'bg-gray-600 text-gray-400' : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {saving ? 'Saving...' : 'Save Banner'}
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

export default AdminSoloBanners;