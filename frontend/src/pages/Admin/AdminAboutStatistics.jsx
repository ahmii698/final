import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';

const API_URL = 'http://127.0.0.1:8000/api/admin';

function AdminAboutStatistics() {
  const [statistics, setStatistics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStat, setEditingStat] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    number: '',
    label: '',
    order: 0,
    active: 1
  });

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await fetch(`${API_URL}/about-statistics`);
      const result = await response.json();
      if (result.success) {
        setStatistics(result.data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const method = editingStat ? 'PUT' : 'POST';
      const url = editingStat 
        ? `${API_URL}/about-statistics/${editingStat.id}`
        : `${API_URL}/about-statistics`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      if (result.success) {
        fetchStatistics();
        setShowModal(false);
        resetForm();
        alert(editingStat ? 'Statistic updated!' : 'Statistic added!');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error saving statistic');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this statistic?')) {
      try {
        const response = await fetch(`${API_URL}/about-statistics/${id}`, {
          method: 'DELETE'
        });
        const result = await response.json();
        if (result.success) {
          fetchStatistics();
          alert('Statistic deleted!');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error deleting statistic');
      }
    }
  };

  const resetForm = () => {
    setEditingStat(null);
    setFormData({
      number: '',
      label: '',
      order: 0,
      active: 1
    });
  };

  const editStat = (stat) => {
    setEditingStat(stat);
    setFormData({
      number: stat.number,
      label: stat.label,
      order: stat.order || 0,
      active: stat.active
    });
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
        <h1 className="text-2xl font-bold text-white">About Statistics</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-all"
        >
          + Add Statistic
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-white">
          <thead className="border-b border-white/10">
            <tr className="text-left">
              <th className="p-3">ID</th>
              <th className="p-3">Number</th>
              <th className="p-3">Label</th>
              <th className="p-3">Order</th>
              <th className="p-3">Active</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {statistics.map((stat) => (
              <tr key={stat.id} className="border-b border-white/10 hover:bg-white/5">
                <td className="p-3">{stat.id}</td>
                <td className="p-3 font-bold text-white">{stat.number}</td>
                <td className="p-3 text-white/70">{stat.label}</td>
                <td className="p-3">{stat.order}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${stat.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {stat.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-3">
                  <button onClick={() => editStat(stat)} className="text-blue-400 mr-3 hover:text-blue-300">Edit</button>
                  <button onClick={() => handleDelete(stat.id)} className="text-red-400 hover:text-red-300">Delete</button>
                </td>
              </tr>
            ))}
            {statistics.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-8 text-white/40">
                  No statistics added yet. Click "Add Statistic" to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">{editingStat ? 'Edit' : 'Add'} Statistic</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white mb-2">Number / Value</label>
                <input
                  type="text"
                  value={formData.number}
                  onChange={(e) => setFormData({...formData, number: e.target.value})}
                  className="w-full p-2 rounded bg-gray-800 text-white border border-white/10"
                  required
                  placeholder="e.g., 5000+, 200+, 50+, 100%"
                />
                <p className="text-gray-400 text-sm mt-1">Use + or % symbols if needed</p>
              </div>

              <div>
                <label className="block text-white mb-2">Label / Description</label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData({...formData, label: e.target.value})}
                  className="w-full p-2 rounded bg-gray-800 text-white border border-white/10"
                  required
                  placeholder="e.g., Happy Customers, Exclusive Designs"
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
                  {saving ? 'Saving...' : 'Save Statistic'}
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

export default AdminAboutStatistics;