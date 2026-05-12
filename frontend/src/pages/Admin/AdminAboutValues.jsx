import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';

const API_URL = 'http://127.0.0.1:8000/api/admin';
const BASE_URL = 'http://127.0.0.1:8000';

function AdminAboutValues() {
  const [values, setValues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingValue, setEditingValue] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: '',
    order: 0,
    active: 1
  });
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState('');

  useEffect(() => {
    fetchValues();
  }, []);

  const fetchValues = async () => {
    try {
      const response = await fetch(`${API_URL}/about-values`);
      const result = await response.json();
      if (result.success) {
        setValues(result.data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleIconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIconFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setIconPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('description', formData.description);
    submitData.append('order', formData.order);
    submitData.append('active', formData.active);
    
    if (iconFile) submitData.append('icon', iconFile);
    
    if (editingValue) {
      submitData.append('_method', 'PUT');
    }

    try {
      const url = editingValue 
        ? `${API_URL}/about-values/${editingValue.id}`
        : `${API_URL}/about-values`;
      
      const response = await fetch(url, {
        method: editingValue ? 'POST' : 'POST',
        body: submitData
      });

      const result = await response.json();
      if (result.success) {
        fetchValues();
        setShowModal(false);
        resetForm();
        alert(editingValue ? 'Value updated!' : 'Value added!');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error saving value');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this value?')) {
      try {
        const response = await fetch(`${API_URL}/about-values/${id}`, {
          method: 'DELETE'
        });
        const result = await response.json();
        if (result.success) {
          fetchValues();
          alert('Value deleted!');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error deleting value');
      }
    }
  };

  const resetForm = () => {
    setEditingValue(null);
    setFormData({
      title: '',
      description: '',
      icon: '',
      order: 0,
      active: 1
    });
    setIconFile(null);
    setIconPreview('');
  };

  const editValue = (value) => {
    setEditingValue(value);
    setFormData({
      title: value.title,
      description: value.description,
      icon: value.icon || '',
      order: value.order || 0,
      active: value.active
    });
    if (value.icon) setIconPreview(`${BASE_URL}${value.icon}`);
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
        <h1 className="text-2xl font-bold text-white">About Values</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-all"
        >
          + Add Value
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-white">
          <thead className="border-b border-white/10">
            <tr className="text-left">
              <th className="p-3">ID</th>
              <th className="p-3">Icon</th>
              <th className="p-3">Title</th>
              <th className="p-3">Description</th>
              <th className="p-3">Order</th>
              <th className="p-3">Active</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {values.map((value) => (
              <tr key={value.id} className="border-b border-white/10 hover:bg-white/5">
                <td className="p-3">{value.id}</td>
                <td className="p-3">
                  {value.icon ? (
                    <img 
                      src={`${BASE_URL}${value.icon}`} 
                      alt={value.title}
                      className="w-10 h-10 object-cover rounded"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-white/10 rounded flex items-center justify-center">
                      <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                  )}
                </td>
                <td className="p-3 font-medium">{value.title}</td>
                <td className="p-3 text-white/60 max-w-md truncate">{value.description}</td>
                <td className="p-3">{value.order}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${value.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {value.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-3">
                  <button onClick={() => editValue(value)} className="text-blue-400 mr-3 hover:text-blue-300">Edit</button>
                  <button onClick={() => handleDelete(value.id)} className="text-red-400 hover:text-red-300">Delete</button>
                </td>
              </tr>
            ))}
            {values.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center py-8 text-white/40">
                  No values added yet. Click "Add Value" to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">{editingValue ? 'Edit' : 'Add'} Value</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white mb-2">Icon (Optional)</label>
                {iconPreview && (
                  <div className="mb-3">
                    <img src={iconPreview} alt="Icon Preview" className="w-16 h-16 object-cover rounded-lg" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleIconChange}
                  className="w-full p-2 rounded bg-gray-800 text-white border border-white/10"
                />
                <p className="text-gray-400 text-sm mt-1">Upload custom icon (SVG, PNG, JPG)</p>
              </div>

              <div>
                <label className="block text-white mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full p-2 rounded bg-gray-800 text-white border border-white/10"
                  required
                  placeholder="e.g., Quality First, Passion, Timeless Design"
                />
              </div>

              <div>
                <label className="block text-white mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="3"
                  className="w-full p-2 rounded bg-gray-800 text-white border border-white/10"
                  required
                  placeholder="Enter description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white mb-2">Display Order</label>
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
                  {saving ? 'Saving...' : 'Save Value'}
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

export default AdminAboutValues;