import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';

const API_URL = 'http://127.0.0.1:8000/api/admin';
const BASE_URL = 'http://127.0.0.1:8000';

function AdminPaymentProofs() {
  const [proofs, setProofs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedProof, setSelectedProof] = useState(null);

  useEffect(() => {
    fetchProofs();
  }, []);

  const fetchProofs = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_URL}/payment-proofs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setProofs(data.data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    if (!confirm(`Are you sure you want to ${status} this payment proof?`)) return;
    
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_URL}/payment-proofs/${id}/${status}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        fetchProofs();
        alert(`Payment ${status}ed successfully!`);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'approved': return 'bg-green-500/20 text-green-400';
      case 'rejected': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const filteredProofs = proofs.filter(proof => {
    if (filter === 'all') return true;
    return proof.status === filter;
  });

  const pendingCount = proofs.filter(p => p.status === 'pending').length;

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
          <h1 className="text-2xl font-bold text-white">Payment Proofs</h1>
          {pendingCount > 0 && (
            <p className="text-yellow-400 text-sm mt-1">{pendingCount} pending approvals</p>
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
            onClick={() => setFilter('pending')}
            className={`px-3 py-1 rounded-lg text-sm ${
              filter === 'pending' ? 'bg-white text-black' : 'bg-white/10 text-white/70'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-3 py-1 rounded-lg text-sm ${
              filter === 'approved' ? 'bg-white text-black' : 'bg-white/10 text-white/70'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-3 py-1 rounded-lg text-sm ${
              filter === 'rejected' ? 'bg-white text-black' : 'bg-white/10 text-white/70'
            }`}
          >
            Rejected
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-white">
          <thead className="border-b border-white/10">
            <tr className="text-left">
              <th className="p-3">ID</th>
              <th className="p-3">Order ID</th>
              <th className="p-3">Screenshot</th>
              <th className="p-3">Status</th>
              <th className="p-3">Submitted On</th>
              <th className="p-3">Actions</th>
             </tr>
          </thead>
          <tbody>
            {filteredProofs.map((proof) => (
              <tr key={proof.id} className="border-b border-white/10 hover:bg-white/5">
                <td className="p-3">#{proof.id}</td>
                <td className="p-3">
                  {proof.order_id ? (
                    <span className="text-blue-400">Order #{proof.order_id}</span>
                  ) : (
                    <span className="text-white/40">N/A</span>
                  )}
                </td>
                <td className="p-3">
                  {proof.screenshot && (
                    <button
                      onClick={() => setSelectedProof(proof)}
                      className="text-blue-400 hover:text-blue-300 text-sm underline"
                    >
                      View Screenshot
                    </button>
                  )}
                </td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(proof.status)}`}>
                    {proof.status}
                  </span>
                </td>
                <td className="p-3 text-white/50 text-sm">
                  {new Date(proof.created_at).toLocaleString()}
                </td>
                <td className="p-3">
                  {proof.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateStatus(proof.id, 'approve')}
                        className="text-green-400 mr-3 hover:text-green-300 text-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => updateStatus(proof.id, 'reject')}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {proof.status === 'approved' && (
                    <span className="text-green-400 text-sm">✓ Approved</span>
                  )}
                  {proof.status === 'rejected' && (
                    <span className="text-red-400 text-sm">✗ Rejected</span>
                  )}
                </td>
              </tr>
            ))}
            {filteredProofs.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-8 text-white/40">
                  No payment proofs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Screenshot Modal */}
      {selectedProof && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setSelectedProof(null)}>
          <div className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 relative border border-white/10" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedProof(null)}
              className="absolute top-4 right-4 text-white/40 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-xl font-bold text-white mb-4">Payment Screenshot</h2>
            
            <div className="mb-4">
              <p className="text-white/40 text-sm">Order ID: <span className="text-white">{selectedProof.order_id || 'N/A'}</span></p>
              <p className="text-white/40 text-sm mt-1">Status: <span className={`${getStatusBadge(selectedProof.status)}`}>{selectedProof.status}</span></p>
              <p className="text-white/40 text-sm mt-1">Submitted: {new Date(selectedProof.created_at).toLocaleString()}</p>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 flex justify-center">
              <img
                src={`${BASE_URL}${selectedProof.screenshot}`}
                alt="Payment Screenshot"
                className="max-w-full max-h-[60vh] object-contain rounded-lg"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/500x300?text=Image+Not+Found';
                }}
              />
            </div>

            {selectedProof.status === 'pending' && (
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    updateStatus(selectedProof.id, 'approve');
                    setSelectedProof(null);
                  }}
                  className="flex-1 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all"
                >
                  Approve Payment
                </button>
                <button
                  onClick={() => {
                    updateStatus(selectedProof.id, 'reject');
                    setSelectedProof(null);
                  }}
                  className="flex-1 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all"
                >
                  Reject Payment
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminPaymentProofs;