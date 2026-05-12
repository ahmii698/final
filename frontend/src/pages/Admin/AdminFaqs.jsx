import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';

const API_URL = 'http://127.0.0.1:8000/api';

function AdminFaqs() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    question: '', answer: '', order: ''
  });

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_URL}/admin/faqs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setFaqs(data.data);
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
      const response = await fetch(`${API_URL}/admin/faqs${editing ? `/${editing.id}` : ''}`, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        fetchFaqs();
        setEditing(null);
        setFormData({ question: '', answer: '', order: '' });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return;
    const token = localStorage.getItem('admin_token');
    try {
      await fetch(`${API_URL}/admin/faqs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      fetchFaqs();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) return <AdminLayout><div className="text-white">Loading...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="bg-black rounded-xl border border-white/10 p-6">
        <h2 className="text-xl font-bold text-white mb-4">
          {editing ? 'Edit FAQ' : 'Add New FAQ'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          <input type="text" placeholder="Question" value={formData.question} onChange={(e) => setFormData({ ...formData, question: e.target.value })} className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white" required />
          <textarea placeholder="Answer" value={formData.answer} onChange={(e) => setFormData({ ...formData, answer: e.target.value })} rows={3} className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white" required />
          <input type="number" placeholder="Order" value={formData.order} onChange={(e) => setFormData({ ...formData, order: e.target.value })} className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white" />
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-white text-black rounded-lg font-semibold">{editing ? 'Update' : 'Add'}</button>
            {editing && <button type="button" onClick={() => { setEditing(null); setFormData({ question: '', answer: '', order: '' }); }} className="px-4 py-2 bg-white/10 text-white rounded-lg">Cancel</button>}
          </div>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-white/10">
              <tr><th className="py-3 text-white/60">Question</th><th className="py-3 text-white/60">Order</th><th className="py-3 text-white/60">Actions</th></tr>
            </thead>
            <tbody>
              {faqs.map(faq => (
                <tr key={faq.id} className="border-b border-white/10">
                  <td className="py-3 text-white max-w-md">{faq.question}</td>
                  <td className="py-3 text-white/70">{faq.order}</td>
                  <td className="py-3">
                    <button onClick={() => { setEditing(faq); setFormData(faq); }} className="text-blue-400 mr-3">Edit</button>
                    <button onClick={() => handleDelete(faq.id)} className="text-red-400">Delete</button>
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

export default AdminFaqs;