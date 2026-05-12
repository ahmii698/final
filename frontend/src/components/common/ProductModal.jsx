import { useEffect } from 'react';

function ProductModal({ product, isOpen, onClose }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/20 shadow-2xl animate-fadeInUp">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Image Section */}
          <div className="md:w-1/2 p-6">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover rounded-xl"
            />
          </div>

          {/* Details Section */}
          <div className="md:w-1/2 p-6">
            <h2 className="text-3xl font-bold text-white mb-2">{product.name}</h2>
            {product.category && (
              <span className="text-sm text-white/40 uppercase tracking-wider">{product.category}</span>
            )}
            
            <div className="mt-4">
              {product.oldPrice ? (
                <>
                  <span className="text-3xl font-bold text-white">${product.price}</span>
                  <span className="text-xl text-gray-500 line-through ml-3">${product.oldPrice}</span>
                </>
              ) : (
                <span className="text-3xl font-bold text-white">${product.price}</span>
              )}
            </div>

            {product.rating && (
              <div className="flex items-center mt-2">
                <div className="flex text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <span className="text-white/40 text-sm ml-2">({product.reviews || 0} reviews)</span>
              </div>
            )}

            <div className="mt-6">
              <h3 className="text-white font-semibold mb-2">Description</h3>
              <p className="text-white/60 leading-relaxed">
                {product.description || 'Premium quality product with exceptional craftsmanship. Designed for those who appreciate luxury and elegance.'}
              </p>
            </div>

            {product.features && (
              <div className="mt-4">
                <h3 className="text-white font-semibold mb-2">Features</h3>
                <ul className="text-white/60 list-disc list-inside space-y-1">
                  {product.features.map((feature, i) => (
                    <li key={i}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-8 flex gap-3">
              <button className="flex-1 py-3 bg-white text-black rounded-xl font-semibold hover:bg-gray-200 transition-colors">
                Add to Cart
              </button>
              <button className="flex-1 py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-colors">
                Add to Wishlist
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductModal;