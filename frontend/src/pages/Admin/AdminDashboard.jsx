import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';

const API_URL = 'http://127.0.0.1:8000/api';

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin');
      return;
    }
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_URL}/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-white mb-6">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl p-6 border border-white/10">
            <div className="text-3xl font-bold text-white mb-2">{stats.totalProducts}</div>
            <div className="text-white/50 text-sm">Total Products</div>
          </div>
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl p-6 border border-white/10">
            <div className="text-3xl font-bold text-white mb-2">{stats.totalOrders}</div>
            <div className="text-white/50 text-sm">Total Orders</div>
          </div>
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl p-6 border border-white/10">
            <div className="text-3xl font-bold text-white mb-2">{stats.totalUsers}</div>
            <div className="text-white/50 text-sm">Total Users</div>
          </div>
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl p-6 border border-white/10">
            <div className="text-3xl font-bold text-white mb-2">${stats.totalRevenue}</div>
            <div className="text-white/50 text-sm">Total Revenue</div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;