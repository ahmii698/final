import { useState } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import ProductModal from '../components/common/ProductModal';

const initialWishlist = [
  { id: 1, name: 'Tungsten Carbide Ring', price: 299, oldPrice: 499, image: '/images/122.webp', rating: 4.8 },
  { id: 3, name: 'Leather Cuff Bracelet', price: 89, image: '/images/2.webp', rating: 4.5 },
  { id: 5, name: 'Carbon Fiber Ring', price: 399, oldPrice: 599, image: '/images/6.jpg', rating: 4.7 },
];

function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState(initialWishlist);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const removeFromWishlist = (id) => {
    setWishlistItems(items => items.filter(item => item.id !== id));
  };

  const addToCart = (product) => {
    alert(`Added ${product.name} to cart!`);
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[30vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="/images/15.webp" alt="Wishlist Hero" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-wider text-white">My Wishlist</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">{wishlistItems.length} saved items</p>
          <div className="w-24 h-px bg-white/20 mx-auto mt-6" />
        </div>
      </section>

      {/* Wishlist Content */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        {wishlistItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/10 flex items-center justify-center">
              <svg className="w-12 h-12 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Your wishlist is empty</h3>
            <p className="text-white/50 mb-6">Save your favorite items here.</p>
            <a href="/shop" className="px-6 py-3 bg-white text-black rounded-xl font-semibold hover:bg-gray-200 transition-all hover:scale-105 inline-block">Start Shopping</a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((product) => (
              <div key={product.id} className="bg-gradient-to-br from-gray-900 to-black rounded-xl overflow-hidden border border-white/10 transition-all duration-300 hover:border-white/20">
                <div className="relative h-64 overflow-hidden cursor-pointer" onClick={() => setSelectedProduct(product)}>
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  <button onClick={(e) => { e.stopPropagation(); removeFromWishlist(product.id); }} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-red-500 transition-colors">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="text-white font-semibold mb-1 line-clamp-1">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <div>{product.oldPrice ? <><span className="text-white font-bold">${product.price}</span><span className="text-white/40 line-through text-sm ml-2">${product.oldPrice}</span></> : <span className="text-white font-bold">${product.price}</span>}</div>
                    <div className="flex items-center"><span className="text-yellow-500 text-sm">★</span><span className="text-white/40 text-sm ml-1">{product.rating}</span></div>
                  </div>
                  <button onClick={() => addToCart(product)} className="w-full mt-3 py-2 bg-white text-black rounded-lg text-sm font-semibold hover:bg-gray-200 transition-all">Add to Cart</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Product Modal */}
      {selectedProduct && <ProductModal product={selectedProduct} isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)} />}

      <Footer />
    </div>
  );
}

export default Wishlist;