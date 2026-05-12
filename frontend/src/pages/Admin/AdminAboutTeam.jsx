import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';

const API_URL = 'http://127.0.0.1:8000/api/admin';
const BASE_URL = 'http://127.0.0.1:8000';

function AdminAboutTeam() {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    bio: '',
    experience: '',
    order: 0,
    active: 1
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const response = await fetch(`${API_URL}/about-team`);
      const result = await response.json();
      if (result.success) {
        setTeam(result.data);
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
    submitData.append('name', formData.name);
    submitData.append('position', formData.position);
    submitData.append('bio', formData.bio);
    submitData.append('experience', formData.experience);
    submitData.append('order', formData.order);
    submitData.append('active', formData.active);
    
    if (imageFile) submitData.append('image', imageFile);
    
    if (editingMember) {
      submitData.append('_method', 'PUT');
    }

    try {
      const url = editingMember 
        ? `${API_URL}/about-team/${editingMember.id}`
        : `${API_URL}/about-team`;
      
      const response = await fetch(url, {
        method: 'POST',
        body: submitData
      });
      
      const result = await response.json();
      if (result.success) {
        fetchTeam();
        setShowModal(false);
        resetForm();
        alert(editingMember ? 'Team member updated!' : 'Team member added!');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error saving team member');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this team member?')) {
      try {
        const response = await fetch(`${API_URL}/about-team/${id}`, {
          method: 'DELETE'
        });
        const result = await response.json();
        if (result.success) {
          fetchTeam();
          alert('Team member deleted!');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error deleting team member');
      }
    }
  };

  const resetForm = () => {
    setEditingMember(null);
    setFormData({
      name: '',
      position: '',
      bio: '',
      experience: '',
      order: 0,
      active: 1
    });
    setImageFile(null);
    setImagePreview('');
  };

  const editMember = (member) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      position: member.position,
      bio: member.bio || '',
      experience: member.experience || '',
      order: member.order || 0,
      active: member.active
    });
    if (member.image) setImagePreview(`${BASE_URL}${member.image}`);
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
        <h1 className="text-2xl font-bold text-white">About Team Members</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-all"
        >
          + Add Team Member
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-white">
          <thead className="border-b border-white/10">
            <tr className="text-left">
              <th className="p-3">Image</th>
              <th className="p-3">Name</th>
              <th className="p-3">Position</th>
              <th className="p-3">Experience</th>
              <th className="p-3">Order</th>
              <th className="p-3">Active</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {team.map((member) => (
              <tr key={member.id} className="border-b border-white/10 hover:bg-white/5">
                <td className="p-3">
                  {member.image && (
                    <img 
                      src={`${BASE_URL}${member.image}`} 
                      alt={member.name}
                      className="w-12 h-12 object-cover rounded-full"
                    />
                  )}
                </td>
                <td className="p-3 font-medium">{member.name}</td>
                <td className="p-3 text-white/60">{member.position}</td>
                <td className="p-3">{member.experience}+ yrs</td>
                <td className="p-3">{member.order}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${member.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {member.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-3">
                  <button onClick={() => editMember(member)} className="text-blue-400 mr-3 hover:text-blue-300">Edit</button>
                  <button onClick={() => handleDelete(member.id)} className="text-red-400 hover:text-red-300">Delete</button>
                </td>
              </tr>
            ))}
            {team.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center py-8 text-white/40">
                  No team members added yet. Click "Add Team Member" to get started.
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
            <h2 className="text-xl font-bold text-white mb-4">{editingMember ? 'Edit' : 'Add'} Team Member</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white mb-2">Profile Image</label>
                {imagePreview && (
                  <div className="mb-3">
                    <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-full" />
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
                <label className="block text-white mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-2 rounded bg-gray-800 text-white border border-white/10"
                  required
                  placeholder="e.g., Alexander Reynolds"
                />
              </div>

              <div>
                <label className="block text-white mb-2">Position / Title</label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => setFormData({...formData, position: e.target.value})}
                  className="w-full p-2 rounded bg-gray-800 text-white border border-white/10"
                  required
                  placeholder="e.g., Founder & Creative Director"
                />
              </div>

              <div>
                <label className="block text-white mb-2">Bio / Description</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  rows="3"
                  className="w-full p-2 rounded bg-gray-800 text-white border border-white/10"
                  placeholder="Brief description about the team member..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white mb-2">Experience (years)</label>
                  <input
                    type="number"
                    value={formData.experience}
                    onChange={(e) => setFormData({...formData, experience: e.target.value})}
                    className="w-full p-2 rounded bg-gray-800 text-white border border-white/10"
                    placeholder="e.g., 20"
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Display Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})}
                    className="w-full p-2 rounded bg-gray-800 text-white border border-white/10"
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
                  {saving ? 'Saving...' : 'Save Team Member'}
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

export default AdminAboutTeam;