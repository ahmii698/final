import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';

const API_URL = 'http://127.0.0.1:8000/api/admin';

function AdminContactSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [replyData, setReplyData] = useState({
    subject: '',
    message: ''
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await fetch(`${API_URL}/contact-submissions`);
      const result = await response.json();
      if (result.success) {
        setSubmissions(result.data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const response = await fetch(`${API_URL}/contact-submissions/${id}/read`, {
        method: 'PUT'
      });
      const result = await response.json();
      if (result.success) {
        fetchSubmissions();
        alert('Marked as read');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        const response = await fetch(`${API_URL}/contact-submissions/${id}`, {
          method: 'DELETE'
        });
        const result = await response.json();
        if (result.success) {
          fetchSubmissions();
          alert('Deleted successfully');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const openReplyModal = (submission) => {
    setSelectedSubmission(submission);
    setReplyData({
      subject: `Re: ${submission.subject || 'Contact Form Message'}`,
      message: ''
    });
    setShowReplyModal(true);
  };

  const sendReply = async (e) => {
    e.preventDefault();
    setSending(true);
    
    // Only send the message without Best Regards (backend will add)
    try {
      const response = await fetch(`${API_URL}/contact-submissions/${selectedSubmission.id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: selectedSubmission.email,
          subject: replyData.subject,
          message: replyData.message,  // No Best Regards here
          customer_name: selectedSubmission.name
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('Reply sent successfully!');
        setShowReplyModal(false);
        setReplyData({ subject: '', message: '' });
        setSelectedSubmission(null);
        
        if (selectedSubmission.is_read === 0) {
          await markAsRead(selectedSubmission.id);
        }
      } else {
        alert(result.message || 'Failed to send reply');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Network error. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const filteredSubmissions = submissions.filter(sub => {
    if (filter === 'unread') return sub.is_read === 0;
    if (filter === 'read') return sub.is_read === 1;
    return true;
  });

  const unreadCount = submissions.filter(s => s.is_read === 0).length;

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
        <div>
          <h1 className="text-2xl font-bold text-white">Contact Submissions</h1>
          {unreadCount > 0 && (
            <p className="text-yellow-400 text-sm mt-1">{unreadCount} unread messages</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-sm ${
              filter === 'all' ? 'bg-white text-black' : 'bg-white/10 text-white/70'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1 rounded-lg text-sm ${
              filter === 'unread' ? 'bg-white text-black' : 'bg-white/10 text-white/70'
            }`}
          >
            Unread
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`px-3 py-1 rounded-lg text-sm ${
              filter === 'read' ? 'bg-white text-black' : 'bg-white/10 text-white/70'
            }`}
          >
            Read
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-white">
          <thead className="border-b border-white/10">
            <tr className="text-left">
              <th className="p-3">ID</th>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Subject</th>
              <th className="p-3">Message</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubmissions.map((sub) => (
              <tr key={sub.id} className={`border-b border-white/10 hover:bg-white/5 ${sub.is_read === 0 ? 'bg-yellow-500/5' : ''}`}>
                <td className="p-3">{sub.id}</td>
                <td className="p-3 font-medium">{sub.name}</td>
                <td className="p-3 text-blue-400">{sub.email}</td>
                <td className="p-3 text-white/70">{sub.subject || 'No subject'}</td>
                <td className="p-3 max-w-md">
                  <p className="truncate">{sub.message}</p>
                </td>
                <td className="p-3">
                  {sub.is_read === 0 ? (
                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">Unread</span>
                  ) : (
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">Read</span>
                  )}
                </td>
                <td className="p-3 text-white/50 text-sm">
                  {new Date(sub.created_at).toLocaleString()}
                </td>
                <td className="p-3">
                  <button 
                    onClick={() => openReplyModal(sub)} 
                    className="text-blue-400 mr-3 hover:text-blue-300 text-sm"
                    title="Reply via Email"
                  >
                    ✉️ Reply
                  </button>
                  {sub.is_read === 0 && (
                    <button 
                      onClick={() => markAsRead(sub.id)} 
                      className="text-green-400 mr-3 hover:text-green-300 text-sm"
                    >
                      Mark Read
                    </button>
                  )}
                  <button 
                    onClick={() => handleDelete(sub.id)} 
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filteredSubmissions.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center py-8 text-white/40">
                  No contact submissions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Reply Modal */}
      {showReplyModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl max-w-lg w-full p-6 relative border border-white/10">
            <button
              onClick={() => {
                setShowReplyModal(false);
                setReplyData({ subject: '', message: '' });
                setSelectedSubmission(null);
              }}
              className="absolute top-4 right-4 text-white/40 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="mb-4 pb-3 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">Reply to {selectedSubmission.name}</h2>
              <p className="text-white/40 text-sm mt-1">
                To: <span className="text-blue-400">{selectedSubmission.email}</span>
              </p>
            </div>

            {/* Original Message Box */}
            <div className="mb-4 p-3 bg-gray-800 rounded-lg border border-white/10">
              <p className="text-white/50 text-xs mb-1 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Original Message from {selectedSubmission.name}:
              </p>
              <p className="text-white/70 text-sm mt-1 italic">"{selectedSubmission.message}"</p>
            </div>

            <form onSubmit={sendReply} className="space-y-4">
              <div>
                <label className="block text-white/70 text-sm mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={replyData.subject}
                  onChange={(e) => setReplyData({...replyData, subject: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl bg-gray-800 text-white border border-white/10 focus:border-white/30 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-1">Your Reply</label>
                <textarea
                  required
                  rows={6}
                  value={replyData.message}
                  onChange={(e) => setReplyData({...replyData, message: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl bg-gray-800 text-white border border-white/10 focus:border-white/30 focus:outline-none resize-none"
                  placeholder="Type your reply here..."
                />
                <p className="text-white/30 text-xs mt-2">
                  ⓘ Signature (Best Regards, LUXE Support Team) will be added automatically
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={sending}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all disabled:opacity-50"
                >
                  {sending ? 'Sending...' : 'Send Reply'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowReplyModal(false);
                    setReplyData({ subject: '', message: '' });
                    setSelectedSubmission(null);
                  }}
                  className="flex-1 py-2 bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all"
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

export default AdminContactSubmissions;