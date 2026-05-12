import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

// Sample products data - In real app, fetch from API
const products = {
  1: { id: 1, name: 'Tungsten Carbide Ring', price: 299, oldPrice: 499, image: '/images/122.webp', hoverImage: '/images/122-closeup.jpg', description: 'Premium tungsten carbide ring with black finish. Scratch-resistant and hypoallergenic. Perfect for daily wear.', features: ['Scratch resistant', 'Hypoallergenic', 'Lifetime warranty', 'Comfort fit'] },
  2: { id: 2, name: "Men's Silver Chain", price: 199, oldPrice: 349, image: '/images/121.webp', hoverImage: '/images/121-closeup.jpg', description: '925 sterling silver chain necklace with elegant design. Perfect for any occasion.', features: ['925 Sterling Silver', 'Hypoallergenic', 'Tarnish resistant', 'Gift box included'] },
  3: { id: 3, name: 'Leather Cuff Bracelet', price: 89, image: '/images/2.webp', hoverImage: '/images/2-closeup.jpg', description: 'Handcrafted genuine leather bracelet with magnetic clasp. Modern and stylish.', features: ['Genuine leather', 'Magnetic clasp', 'Adjustable fit', 'Handcrafted'] },
};

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = products[id];

  if (!product) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="pt-32 text-center">
          <h1 className="text-white text-2xl">Product not found</h1>
          <button onClick={() => navigate('/shop')} className="mt-4 px-6 py-2 bg-white text-black rounded-full">Back to Shop</button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      {/* Product Detail */}
      <section className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Image */}
          <div className="rounded-2xl overflow-hidden border border-white/10">
            <img src={product.image} alt={product.name} className="w-full h-auto object-cover" />
          </div>

          {/* Info */}
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{product.name}</h1>
            <div className="flex items-center gap-3 mb-6">
              {product.oldPrice ? (
                <>
                  <span className="text-3xl font-bold text-white">${product.price}</span>
                  <span className="text-xl text-white/40 line-through">${product.oldPrice}</span>
                </>
              ) : (
                <span className="text-3xl font-bold text-white">${product.price}</span>
              )}
            </div>

            <p className="text-white/60 leading-relaxed mb-6">{product.description}</p>

            <div className="mb-8">
              <h3 className="text-white font-semibold mb-3">Features</h3>
              <ul className="space-y-2">
                {product.features.map((feature, i) => (
                  <li key={i} className="text-white/50 text-sm flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button className="flex-1 py-3 bg-white text-black rounded-xl font-semibold hover:bg-gray-200 transition-all">
                Add to Cart
              </button>
              <button className="flex-1 py-3 bg-white/10 border border-white/20 rounded-xl text-white font-semibold hover:bg-white/20 transition-all">
                Add to Wishlist
              </button>
            </div>

            {/* Customize Button */}
            <div className="mt-4">
              <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all">
                Customize This Product →
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default ProductDetail;