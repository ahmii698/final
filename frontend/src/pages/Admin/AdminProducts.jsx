import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';

const API_URL = 'http://127.0.0.1:8000/api';
const BASE_URL = 'http://127.0.0.1:8000';

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [hoverImageFile, setHoverImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [hoverImagePreview, setHoverImagePreview] = useState('');
  const [formData, setFormData] = useState({
    name: '', price: '', old_price: '', image: '', hover_image: '', rating: '', category: '', order: '', is_featured: 0
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_URL}/admin/products`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setProducts(data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `${BASE_URL}${imagePath}`;
  };

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (type === 'main') {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setHoverImageFile(file);
      setHoverImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('admin_token');
    
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('price', formData.price);
    formDataToSend.append('old_price', formData.old_price || '');
    formDataToSend.append('rating', formData.rating);
    formDataToSend.append('category', formData.category);
    formDataToSend.append('order', formData.order);
    formDataToSend.append('is_featured', formData.is_featured);
    
    if (imageFile) formDataToSend.append('image', imageFile);
    if (hoverImageFile) formDataToSend.append('hover_image', hoverImageFile);
    
    if (editing) {
      formDataToSend.append('_method', 'PUT');
    }

    try {
      const url = editing ? `${API_URL}/admin/products/${editing.id}` : `${API_URL}/admin/products`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataToSend
      });
      
      if (response.ok) {
        fetchProducts();
        setEditing(null);
        setFormData({ name: '', price: '', old_price: '', image: '', hover_image: '', rating: '', category: '', order: '', is_featured: 0 });
        setImageFile(null);
        setHoverImageFile(null);
        setImagePreview('');
        setHoverImagePreview('');
        alert('Product saved successfully!');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error saving product');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return;
    const token = localStorage.getItem('admin_token');
    try {
      await fetch(`${API_URL}/admin/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      fetchProducts();
      alert('Product deleted!');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) return <AdminLayout><div className="text-white">Loading...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="bg-black rounded-xl border border-white/10 p-6">
        <h2 className="text-xl font-bold text-white mb-4">
          {editing ? 'Edit Product' : 'Add New Product'}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <input type="text" placeholder="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white" required />
          <input type="number" placeholder="Price" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white" required />
          <input type="number" placeholder="Old Price" value={formData.old_price} onChange={(e) => setFormData({ ...formData, old_price: e.target.value })} className="bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white" />
          <input type="text" placeholder="Category (rings/chains/watches/bracelets)" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white" />
          <input type="number" step="0.1" placeholder="Rating" value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: e.target.value })} className="bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white" />
          <input type="number" placeholder="Order" value={formData.order} onChange={(e) => setFormData({ ...formData, order: e.target.value })} className="bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white" />
          
          <label className="flex items-center gap-2 text-white">
            <input type="checkbox" checked={formData.is_featured == 1} onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked ? 1 : 0 })} />
            Featured Product
          </label>
          
          {/* Image Upload */}
          <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-white text-sm block mb-2">Main Image</label>
              <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, 'main')} className="bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white w-full" />
              {imagePreview && (
                <div className="mt-2">
                  <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-lg" />
                </div>
              )}
              {formData.image && !imageFile && (
                <div className="mt-2">
                  <img src={getImageUrl(formData.image)} alt="Current" className="w-20 h-20 object-cover rounded-lg" />
                  <p className="text-white/40 text-xs mt-1">Current image</p>
                </div>
              )}
            </div>
            
            <div>
              <label className="text-white text-sm block mb-2">Hover Image</label>
              <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, 'hover')} className="bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white w-full" />
              {hoverImagePreview && (
                <div className="mt-2">
                  <img src={hoverImagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-lg" />
                </div>
              )}
              {formData.hover_image && !hoverImageFile && (
                <div className="mt-2">
                  <img src={getImageUrl(formData.hover_image)} alt="Current" className="w-20 h-20 object-cover rounded-lg" />
                  <p className="text-white/40 text-xs mt-1">Current hover image</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-2 col-span-2">
            <button type="submit" className="px-4 py-2 bg-white text-black rounded-lg font-semibold">{editing ? 'Update' : 'Add'}</button>
            {editing && <button type="button" onClick={() => { setEditing(null); setFormData({ name: '', price: '', old_price: '', image: '', hover_image: '', rating: '', category: '', order: '', is_featured: 0 }); setImagePreview(''); setHoverImagePreview(''); setImageFile(null); setHoverImageFile(null); }} className="px-4 py-2 bg-white/10 text-white rounded-lg">Cancel</button>}
          </div>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-white/10">
              <tr>
                <th className="py-3 text-white/60">Image</th>
                <th className="py-3 text-white/60">Name</th>
                <th className="py-3 text-white/60">Price</th>
                <th className="py-3 text-white/60">Category</th>
                <th className="py-3 text-white/60">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id} className="border-b border-white/10">
                  <td className="py-3">
                    {product.image && (
                      <img 
                        src={getImageUrl(product.image)} 
                        alt={product.name} 
                        className="w-12 h-12 object-cover rounded"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/48x48?text=No+Image';
                        }}
                      />
                    )}
                   </td>
                  <td className="py-3 text-white">{product.name}</td>
                  <td className="py-3 text-white">${product.price}</td>
                  <td className="py-3 text-white/70">{product.category}</td>
                  <td className="py-3">
                    <button onClick={() => { 
                      setEditing(product); 
                      setFormData({
                        name: product.name,
                        price: product.price,
                        old_price: product.old_price || '',
                        image: product.image,
                        hover_image: product.hover_image || '',
                        rating: product.rating || '',
                        category: product.category,
                        order: product.order || '',
                        is_featured: product.is_featured || 0
                      });
                    }} className="text-blue-400 mr-3">Edit</button>
                    <button onClick={() => handleDelete(product.id)} className="text-red-400">Delete</button>
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

export default AdminProducts;