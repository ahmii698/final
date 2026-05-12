import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';

const API_URL = 'http://127.0.0.1:8000/api/admin';
const BASE_URL = 'http://127.0.0.1:8000';

function AdminAboutStory() {
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    image: '',
    heading: '',
    paragraph1: '',
    paragraph2: '',
    paragraph3: '',
    active: 1
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    fetchStory();
  }, []);

  const fetchStory = async () => {
    try {
      console.log('Fetching about story...');
      const response = await fetch(`${API_URL}/about-story`);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Result:', result);
      
      if (result.success && result.data) {
        setStory(result.data);
        setFormData({
          image: result.data.image || '',
          heading: result.data.heading || '',
          paragraph1: result.data.paragraph1 || '',
          paragraph2: result.data.paragraph2 || '',
          paragraph3: result.data.paragraph3 || '',
          active: result.data.active || 1
        });
        if (result.data.image) {
          setImagePreview(`${BASE_URL}${result.data.image}`);
        }
      } else {
        console.log('No data found, creating new story');
        setStory(null);
      }
    } catch (error) {
      console.error('Error fetching story:', error);
      alert('Error loading story data');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    const submitData = new FormData();
    submitData.append('heading', formData.heading);
    submitData.append('paragraph1', formData.paragraph1);
    submitData.append('paragraph2', formData.paragraph2);
    submitData.append('paragraph3', formData.paragraph3);
    submitData.append('active', formData.active);
    submitData.append('_method', 'PUT'); // Add this for Laravel route
    
    if (imageFile) {
      submitData.append('image', imageFile);
    }

    try {
      // Always use POST with _method=PUT
      const url = story 
        ? `${API_URL}/about-story/${story.id}`
        : `${API_URL}/about-story/1`; // Default ID 1
      
      console.log('Sending to:', url);
      
      const response = await fetch(url, {
        method: 'POST', // Always use POST
        body: submitData
      });
      
      console.log('Response status:', response.status);
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('HTML Response:', text.substring(0, 500));
        throw new Error('Server returned HTML instead of JSON. Check Laravel logs.');
      }
      
      const result = await response.json();
      
      if (result.success) {
        await fetchStory(); // Refresh data
        setEditing(false);
        setImageFile(null);
        alert('Story saved successfully!');
      } else {
        alert(result.message || 'Error saving story');
      }
    } catch (error) {
      console.error('Error saving story:', error);
      alert('Error saving story: ' + error.message);
    } finally {
      setSaving(false);
    }
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
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">About Story</h1>
          <button
            onClick={() => {
              setEditing(!editing);
              if (!editing && story) {
                // Reset form data when canceling edit
                setFormData({
                  image: story.image,
                  heading: story.heading,
                  paragraph1: story.paragraph1,
                  paragraph2: story.paragraph2,
                  paragraph3: story.paragraph3,
                  active: story.active
                });
                setImagePreview(`${BASE_URL}${story.image}`);
                setImageFile(null);
              }
            }}
            className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-all"
            disabled={saving}
          >
            {editing ? 'Cancel' : 'Edit Story'}
          </button>
        </div>

        {!editing && story ? (
          // View Mode
          <div className="bg-gray-900 rounded-xl p-6">
            <div className="mb-6">
              <img 
                src={imagePreview || `${BASE_URL}${story.image}`} 
                alt={story.heading}
                className="w-full h-64 object-cover rounded-lg"
                onError={(e) => {
                  console.error('Image failed to load:', e.target.src);
                  e.target.src = 'https://via.placeholder.com/800x400?text=No+Image';
                }}
              />
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-white">{story.heading}</h2>
              <p className="text-gray-300 leading-relaxed">{story.paragraph1}</p>
              {story.paragraph2 && <p className="text-gray-300 leading-relaxed">{story.paragraph2}</p>}
              {story.paragraph3 && <p className="text-gray-300 leading-relaxed">{story.paragraph3}</p>}
              <div className="pt-4">
                <span className={`px-3 py-1 rounded-full text-sm ${story.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {story.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          // Edit Mode
          <form onSubmit={handleSubmit} className="bg-gray-900 rounded-xl p-6 space-y-4">
            <div>
              <label className="block text-white mb-2">Image</label>
              {imagePreview && (
                <div className="mb-3">
                  <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg" />
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
              <label className="block text-white mb-2">Heading</label>
              <input
                type="text"
                value={formData.heading}
                onChange={(e) => setFormData({...formData, heading: e.target.value})}
                className="w-full p-2 rounded bg-gray-800 text-white border border-white/10"
                required
              />
            </div>

            <div>
              <label className="block text-white mb-2">Paragraph 1</label>
              <textarea
                value={formData.paragraph1}
                onChange={(e) => setFormData({...formData, paragraph1: e.target.value})}
                rows="4"
                className="w-full p-2 rounded bg-gray-800 text-white border border-white/10"
                required
              />
            </div>

            <div>
              <label className="block text-white mb-2">Paragraph 2</label>
              <textarea
                value={formData.paragraph2}
                onChange={(e) => setFormData({...formData, paragraph2: e.target.value})}
                rows="4"
                className="w-full p-2 rounded bg-gray-800 text-white border border-white/10"
              />
            </div>

            <div>
              <label className="block text-white mb-2">Paragraph 3</label>
              <textarea
                value={formData.paragraph3}
                onChange={(e) => setFormData({...formData, paragraph3: e.target.value})}
                rows="4"
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

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className={`px-6 py-2 rounded-lg transition-all ${
                  saving 
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {saving ? 'Saving...' : 'Save Story'}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                disabled={saving}
                className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminAboutStory;