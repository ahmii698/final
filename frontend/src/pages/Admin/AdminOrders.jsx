import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';

const API_URL = 'http://127.0.0.1:8000/api';

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_URL}/admin/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setOrders(data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    const token = localStorage.getItem('admin_token');
    try {
      await fetch(`${API_URL}/admin/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      fetchOrders();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'processing': return 'bg-blue-500/20 text-blue-400';
      case 'shipped': return 'bg-purple-500/20 text-purple-400';
      case 'delivered': return 'bg-green-500/20 text-green-400';
      case 'cancelled': return 'bg-red-500/20 text-red-400';
      default: return 'bg-white/10 text-white/60';
    }
  };

  if (loading) return <AdminLayout><div className="text-white">Loading...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="bg-black rounded-xl border border-white/10 p-6">
        <h2 className="text-xl font-bold text-white mb-4">Orders</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-white/10">
              <tr>
                <th className="py-3 text-white/60">Order ID</th>
                <th className="py-3 text-white/60">Customer</th>
                <th className="py-3 text-white/60">Total</th>
                <th className="py-3 text-white/60">Status</th>
                <th className="py-3 text-white/60">Date</th>
                <th className="py-3 text-white/60">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="border-b border-white/10">
                  <td className="py-3 text-white">{order.order_id}</td>
                  <td className="py-3 text-white/70">{order.customer_name}</td>
                  <td className="py-3 text-white">${order.total}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 text-white/70">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="py-3">
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className="bg-gray-800 border border-white/20 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-white/40"
                      style={{ color: 'white', backgroundColor: '#1a1a1a' }}
                    >
                      <option value="pending" className="bg-gray-800 text-white">Pending</option>
                      <option value="processing" className="bg-gray-800 text-white">Processing</option>
                      <option value="shipped" className="bg-gray-800 text-white">Shipped</option>
                      <option value="delivered" className="bg-gray-800 text-white">Delivered</option>
                      <option value="cancelled" className="bg-gray-800 text-white">Cancelled</option>
                    </select>
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

export default AdminOrders;