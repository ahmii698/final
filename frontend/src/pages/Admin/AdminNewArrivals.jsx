import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';

const API_URL = 'http://127.0.0.1:8000/api/admin';
const BASE_URL = 'http://127.0.0.1:8000';

function AdminNewArrivals() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    old_price: '',
    category: '',
    link: '/shop',
    order: 0,
    active: 1,
    rating: 0
  });
  const [imageFile, setImageFile] = useState(null);
  const [hoverImageFile, setHoverImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [hoverImagePreview, setHoverImagePreview] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/new-arrivals`);
      const result = await response.json();
      if (result.success) {
        setProducts(result.data);
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

  const handleHoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setHoverImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setHoverImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('price', formData.price);
    submitData.append('old_price', formData.old_price || '');
    submitData.append('category', formData.category);
    submitData.append('link', formData.link);
    submitData.append('order', formData.order);
    submitData.append('active', formData.active);
    submitData.append('rating', formData.rating);
    
    if (imageFile) submitData.append('image', imageFile);
    if (hoverImageFile) submitData.append('hover_image', hoverImageFile);
    
    if (editingProduct) {
      submitData.append('_method', 'PUT');
    }

    try {
      const url = editingProduct 
        ? `${API_URL}/new-arrivals/${editingProduct.id}`
        : `${API_URL}/new-arrivals`;
      
      const response = await fetch(url, {
        method: editingProduct ? 'POST' : 'POST',
        body: submitData
      });
      
      const result = await response.json();
      if (result.success) {
        fetchProducts();
        setShowModal(false);
        resetForm();
        alert(editingProduct ? 'Product updated!' : 'Product added!');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error saving product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`${API_URL}/new-arrivals/${id}`, {
          method: 'DELETE'
        });
        const result = await response.json();
        if (result.success) {
          fetchProducts();
          alert('Product deleted!');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error deleting product');
      }
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      price: '',
      old_price: '',
      category: '',
      link: '/shop',
      order: 0,
      active: 1,
      rating: 0
    });
    setImageFile(null);
    setHoverImageFile(null);
    setImagePreview('');
    setHoverImagePreview('');
  };

  const editProduct = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      old_price: product.old_price || '',
      category: product.category,
      link: product.link,
      order: product.order,
      active: product.active,
      rating: product.rating || 0
    });
    if (product.image) setImagePreview(`${BASE_URL}${product.image}`);
    if (product.hover_image) setHoverImagePreview(`${BASE_URL}${product.hover_image}`);
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
        <h1 className="text-2xl font-bold text-white">New Arrival Products</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-all"
        >
          + Add Product
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-white">
          <thead className="border-b border-white/10">
            <tr className="text-left">
              <th className="p-3">ID</th>
              <th className="p-3">Image</th>
              <th className="p-3">Name</th>
              <th className="p-3">Price</th>
              <th className="p-3">Category</th>
              <th className="p-3">Order</th>
              <th className="p-3">Active</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-white/10 hover:bg-white/5">
                <td className="p-3">{product.id}</td>
                <td className="p-3">
                  {product.image && (
                    <img 
                      src={`${BASE_URL}${product.image}`} 
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                </td>
                <td className="p-3">{product.name}</td>
                <td className="p-3">
                  ${product.price}
                  {product.old_price && <span className="text-gray-400 line-through text-sm ml-2">${product.old_price}</span>}
                </td>
                <td className="p-3">{product.category}</td>
                <td className="p-3">{product.order}</td>
                <td className="p-3">{product.active ? '✓' : '✗'}</td>
                <td className="p-3">
                  <button onClick={() => editProduct(product)} className="text-blue-400 mr-3 hover:text-blue-300">Edit</button>
                  <button onClick={() => handleDelete(product.id)} className="text-red-400 hover:text-red-300">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">{editingProduct ? 'Edit' : 'Add'} Product</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white mb-2">Product Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-2 rounded bg-gray-800 text-white border border-white/10"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white mb-2">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full p-2 rounded bg-gray-800 text-white border border-white/10"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Old Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.old_price}
                    onChange={(e) => setFormData({...formData, old_price: e.target.value})}
                    className="w-full p-2 rounded bg-gray-800 text-white border border-white/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full p-2 rounded bg-gray-800 text-white border border-white/10"
                    required
                  >
                    <option value="">Select</option>
                    <option value="Rings">Rings</option>
                    <option value="Chains">Chains</option>
                    <option value="Bracelets">Bracelets</option>
                    <option value="Watches">Watches</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white mb-2">Rating (0-5)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.rating}
                    onChange={(e) => setFormData({...formData, rating: e.target.value})}
                    className="w-full p-2 rounded bg-gray-800 text-white border border-white/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white mb-2">Order</label>
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

              <div>
                <label className="block text-white mb-2">Link</label>
                <input
                  type="text"
                  value={formData.link}
                  onChange={(e) => setFormData({...formData, link: e.target.value})}
                  className="w-full p-2 rounded bg-gray-800 text-white border border-white/10"
                  placeholder="/shop"
                />
              </div>

              <div>
                <label className="block text-white mb-2">Main Image</label>
                {imagePreview && (
                  <div className="mb-3">
                    <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full p-2 rounded bg-gray-800 text-white border border-white/10"
                />
              </div>

              <div>
                <label className="block text-white mb-2">Hover Image</label>
                {hoverImagePreview && (
                  <div className="mb-3">
                    <img src={hoverImagePreview} alt="Hover Preview" className="w-20 h-20 object-cover rounded" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleHoverImageChange}
                  className="w-full p-2 rounded bg-gray-800 text-white border border-white/10"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className={`px-6 py-2 rounded-lg transition-all ${
                    saving ? 'bg-gray-600 text-gray-400' : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {saving ? 'Saving...' : 'Save Product'}
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

export default AdminNewArrivals;