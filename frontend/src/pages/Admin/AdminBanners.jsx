import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';

const API_URL = 'http://127.0.0.1:8000/api';
const BASE_URL = 'http://127.0.0.1:8000';

function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [formData, setFormData] = useState({
    image: '', title: '', subtitle: '', button_text: '', button_link: '', order: '', active: 1
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_URL}/admin/banners`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setBanners(data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `${BASE_URL}${imagePath}`;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('admin_token');
    
    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('subtitle', formData.subtitle || '');
    formDataToSend.append('button_text', formData.button_text || '');
    formDataToSend.append('button_link', formData.button_link || '/shop');
    formDataToSend.append('order', formData.order || 0);
    formDataToSend.append('active', formData.active);
    
    if (imageFile) {
      formDataToSend.append('image', imageFile);
    }
    
    if (editing) {
      formDataToSend.append('_method', 'PUT');
    }

    try {
      const url = editing ? `${API_URL}/admin/banners/${editing.id}` : `${API_URL}/admin/banners`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataToSend
      });
      
      if (response.ok) {
        fetchBanners();
        setEditing(null);
        setFormData({ image: '', title: '', subtitle: '', button_text: '', button_link: '', order: '', active: 1 });
        setImageFile(null);
        setImagePreview('');
        alert('Banner saved successfully!');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error saving banner');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return;
    const token = localStorage.getItem('admin_token');
    try {
      await fetch(`${API_URL}/admin/banners/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      fetchBanners();
      alert('Banner deleted!');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) return <AdminLayout><div className="text-white">Loading...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="bg-black rounded-xl border border-white/10 p-6">
        <h2 className="text-xl font-bold text-white mb-4">
          {editing ? 'Edit Banner' : 'Add New Banner'}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <input 
            type="text" 
            placeholder="Title" 
            value={formData.title} 
            onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
            className="bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white" 
            required 
          />
          <input 
            type="text" 
            placeholder="Subtitle" 
            value={formData.subtitle} 
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} 
            className="bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white" 
          />
          <input 
            type="text" 
            placeholder="Button Text (e.g., Shop Now)" 
            value={formData.button_text} 
            onChange={(e) => setFormData({ ...formData, button_text: e.target.value })} 
            className="bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white" 
          />
          <input 
            type="text" 
            placeholder="Button Link (e.g., /shop)" 
            value={formData.button_link} 
            onChange={(e) => setFormData({ ...formData, button_link: e.target.value })} 
            className="bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white" 
          />
          <input 
            type="number" 
            placeholder="Order" 
            value={formData.order} 
            onChange={(e) => setFormData({ ...formData, order: e.target.value })} 
            className="bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white" 
          />
          <div className="flex items-center gap-4">
            <label className="text-white text-sm">Active:</label>
            <select 
              value={formData.active} 
              onChange={(e) => setFormData({ ...formData, active: parseInt(e.target.value) })} 
              className="bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white"
            >
              <option value={1}>Yes</option>
              <option value={0}>No</option>
            </select>
          </div>
          
          {/* Image Upload */}
          <div className="col-span-2">
            <label className="text-white text-sm block mb-2">Banner Image</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange} 
              className="bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white w-full" 
            />
            {imagePreview && (
              <div className="mt-2">
                <img src={imagePreview} alt="Preview" className="w-40 h-24 object-cover rounded-lg" />
                <p className="text-white/40 text-xs mt-1">New image preview</p>
              </div>
            )}
            {editing && formData.image && !imageFile && (
              <div className="mt-2">
                <img src={getImageUrl(formData.image)} alt="Current banner" className="w-40 h-24 object-cover rounded-lg" />
                <p className="text-white/40 text-xs mt-1">Current banner image</p>
              </div>
            )}
          </div>
          
          <div className="flex gap-2 col-span-2">
            <button type="submit" className="px-4 py-2 bg-white text-black rounded-lg font-semibold">
              {editing ? 'Update' : 'Add'}
            </button>
            {editing && (
              <button 
                type="button" 
                onClick={() => { 
                  setEditing(null); 
                  setFormData({ image: '', title: '', subtitle: '', button_text: '', button_link: '', order: '', active: 1 }); 
                  setImagePreview(''); 
                  setImageFile(null); 
                }} 
                className="px-4 py-2 bg-white/10 text-white rounded-lg"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-white/10">
              <tr>
                <th className="py-3 text-white/60">Image</th>
                <th className="py-3 text-white/60">Title</th>
                <th className="py-3 text-white/60">Order</th>
                <th className="py-3 text-white/60">Status</th>
                <th className="py-3 text-white/60">Actions</th>
              </tr>
            </thead>
            <tbody>
              {banners.map(banner => (
                <tr key={banner.id} className="border-b border-white/10 hover:bg-white/5">
                  <td className="py-3">
                    {banner.image && (
                      <img 
                        src={getImageUrl(banner.image)} 
                        alt={banner.title} 
                        className="w-16 h-12 object-cover rounded"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/64x48?text=No+Image';
                        }}
                      />
                    )}
                  </td>
                  <td className="py-3 text-white">{banner.title}</td>
                  <td className="py-3 text-white/70">{banner.order}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${banner.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {banner.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3">
                    <button 
                      onClick={() => { 
                        setEditing(banner); 
                        setFormData({
                          image: banner.image,
                          title: banner.title,
                          subtitle: banner.subtitle || '',
                          button_text: banner.button_text || '',
                          button_link: banner.button_link || '/shop',
                          order: banner.order || 0,
                          active: banner.active
                        });
                      }} 
                      className="text-blue-400 mr-3"
                    >
                      Edit
                    </button>
                    <button onClick={() => handleDelete(banner.id)} className="text-red-400">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminBanners;