import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';

const API_URL = 'http://127.0.0.1:8000/api';

function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: '', role: '', text: '', rating: 5, active: 1
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      // Use getAllTestimonials to get both active and pending
      const response = await fetch(`${API_URL}/admin/all-testimonials`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setTestimonials(data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('admin_token');
    
    try {
      const response = await fetch(`${API_URL}/admin/testimonials${editing ? `/${editing.id}` : ''}`, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        fetchTestimonials();
        setEditing(null);
        setFormData({ name: '', role: '', text: '', rating: 5, active: 1 });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    const token = localStorage.getItem('admin_token');
    try {
      await fetch(`${API_URL}/admin/testimonials/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      fetchTestimonials();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleApprove = async (id) => {
    const token = localStorage.getItem('admin_token');
    try {
      await fetch(`${API_URL}/admin/testimonials/${id}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      fetchTestimonials();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleReject = async (id) => {
    if (!confirm('Are you sure you want to reject this testimonial?')) return;
    const token = localStorage.getItem('admin_token');
    try {
      await fetch(`${API_URL}/admin/testimonials/${id}/reject`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      fetchTestimonials();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) return <AdminLayout><div className="text-white">Loading...</div></AdminLayout>;

  // Separate testimonials into pending and approved
  const pendingTestimonials = testimonials.filter(t => t.active === 0);
  const approvedTestimonials = testimonials.filter(t => t.active === 1);

  return (
    <AdminLayout>
      <div className="bg-black rounded-xl border border-white/10 p-6">
        <h2 className="text-xl font-bold text-white mb-4">
          {editing ? 'Edit Testimonial' : 'Add New Testimonial'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input 
              type="text" 
              placeholder="Name" 
              value={formData.name} 
              onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
              className="bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white" 
              required 
            />
            <input 
              type="text" 
              placeholder="Role" 
              value={formData.role} 
              onChange={(e) => setFormData({ ...formData, role: e.target.value })} 
              className="bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white" 
            />
            <input 
              type="number" 
              placeholder="Rating (1-5)" 
              value={formData.rating} 
              onChange={(e) => setFormData({ ...formData, rating: e.target.value })} 
              className="bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white" 
              min="1" 
              max="5"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select 
              value={formData.active} 
              onChange={(e) => setFormData({ ...formData, active: parseInt(e.target.value) })} 
              className="bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white"
            >
              <option value={1}>Active (Show on Website)</option>
              <option value={0}>Pending (Hide until approved)</option>
            </select>
          </div>
          <textarea 
            placeholder="Testimonial Text" 
            value={formData.text} 
            onChange={(e) => setFormData({ ...formData, text: e.target.value })} 
            rows={4} 
            className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white" 
            required 
          />
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-white text-black rounded-lg font-semibold">
              {editing ? 'Update' : 'Add'}
            </button>
            {editing && (
              <button 
                type="button" 
                onClick={() => { 
                  setEditing(null); 
                  setFormData({ name: '', role: '', text: '', rating: 5, active: 1 }); 
                }} 
                className="px-4 py-2 bg-white/10 text-white rounded-lg"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Pending Testimonials Section */}
        {pendingTestimonials.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-bold text-yellow-400 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
              Pending Approval ({pendingTestimonials.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-white/10">
                  <tr>
                    <th className="py-3 text-white/60">Name</th>
                    <th className="py-3 text-white/60">Role</th>
                    <th className="py-3 text-white/60">Rating</th>
                    <th className="py-3 text-white/60">Feedback</th>
                    <th className="py-3 text-white/60">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingTestimonials.map(testimonial => (
                    <tr key={testimonial.id} className="border-b border-white/10 bg-yellow-500/5">
                      <td className="py-3 text-white">{testimonial.name}</td>
                      <td className="py-3 text-white/70">{testimonial.role || 'Customer'}</td>
                      <td className="py-3 text-yellow-400">{'⭐'.repeat(testimonial.rating)}</td>
                      <td className="py-3 text-white/70 max-w-md truncate">{testimonial.text}</td>
                      <td className="py-3">
                        <button 
                          onClick={() => handleApprove(testimonial.id)} 
                          className="text-green-400 mr-3 hover:text-green-300"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleReject(testimonial.id)} 
                          className="text-red-400 hover:text-red-300"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Approved Testimonials Section */}
        <div>
          <h3 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            Approved Testimonials ({approvedTestimonials.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-white/10">
                <tr>
                  <th className="py-3 text-white/60">Name</th>
                  <th className="py-3 text-white/60">Role</th>
                  <th className="py-3 text-white/60">Rating</th>
                  <th className="py-3 text-white/60">Feedback</th>
                  <th className="py-3 text-white/60">Status</th>
                  <th className="py-3 text-white/60">Actions</th>
                 </tr>
              </thead>
              <tbody>
                {approvedTestimonials.map(testimonial => (
                  <tr key={testimonial.id} className="border-b border-white/10">
                    <td className="py-3 text-white">{testimonial.name}</td>
                    <td className="py-3 text-white/70">{testimonial.role || 'Customer'}</td>
                    <td className="py-3 text-yellow-400">{'⭐'.repeat(testimonial.rating)}</td>
                    <td className="py-3 text-white/70 max-w-md truncate">{testimonial.text}</td>
                    <td className="py-3">
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                        Active
                      </span>
                    </td>
                    <td className="py-3">
                      <button 
                        onClick={() => { 
                          setEditing(testimonial); 
                          setFormData(testimonial); 
                        }} 
                        className="text-blue-400 mr-3 hover:text-blue-300"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(testimonial.id)} 
                        className="text-red-400 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {approvedTestimonials.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-white/40">
                      No approved testimonials yet. Approve pending testimonials to show them on website.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminTestimonials;