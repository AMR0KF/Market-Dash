import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProduct, useProducts } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';
import ProductCard from '../components/products/ProductCard';
import { Plus, Minus, ShoppingCart, ChevronRight, Check } from 'lucide-react';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading } = useProduct(id || '');
  const { data: relatedProductsData } = useProducts({ category: product?.categoryId, limit: 5 });
  
  const { items, handleAddItem, handleUpdateItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  if (isLoading) {
    return <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse bg-gray-100 h-96 rounded-xl"></div>;
  }

  if (!product) {
    return <div className="max-w-7xl mx-auto px-4 py-16 text-center text-2xl font-bold">Product not found</div>;
  }

  const cartItem = items.find(item => item.productId === product.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    if (quantityInCart > 0) {
      handleUpdateItem(cartItem!.id, quantityInCart + quantity);
    } else {
      handleAddItem(product.id, quantity);
    }
    setQuantity(1); // Reset local quantity
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="flex text-sm text-gray-500 mb-8">
        <Link to="/" className="hover:text-green-600">Home</Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        {product.category && (
          <>
            <Link to={`/category/${product.category.slug}`} className="hover:text-green-600">{product.category.name}</Link>
            <ChevronRight className="w-4 h-4 mx-2" />
          </>
        )}
        <span className="text-gray-900 font-medium">{product.name}</span>
      </nav>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
          
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 flex items-center justify-center relative">
              {product.images && product.images.length > 0 ? (
                <div className="flex overflow-x-auto snap-x snap-mandatory w-full h-full hide-scrollbar" onScroll={(e) => {
                  const scrollLeft = (e.target as HTMLElement).scrollLeft;
                  const width = (e.target as HTMLElement).clientWidth;
                  setActiveImage(Math.round(scrollLeft / width));
                }}>
                  {product.images.map((img: string, idx: number) => (
                    <img 
                      key={idx}
                      src={img} 
                      alt={`${product.name} ${idx + 1}`} 
                      className="w-full h-full object-cover flex-shrink-0 snap-center"
                    />
                  ))}
                </div>
              ) : (
                <ShoppingCart size={64} className="text-gray-300" />
              )}
              
              {/* Pagination Dots (Mobile) */}
              {product.images && product.images.length > 1 && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 md:hidden pointer-events-none">
                  {product.images.map((_: any, idx: number) => (
                    <div 
                      key={idx} 
                      className={`w-2 h-2 rounded-full transition-colors ${activeImage === idx ? 'bg-green-600' : 'bg-gray-300'}`}
                    />
                  ))}
                </div>
              )}
            </div>
            {/* Desktop Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="hidden md:flex gap-4 overflow-x-auto pb-2">
                {product.images.map((img: string, idx: number) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`w-20 h-20 min-h-[44px] min-w-[44px] rounded-xl border-2 overflow-hidden flex-shrink-0 ${activeImage === idx ? 'border-green-500' : 'border-transparent opacity-70 hover:opacity-100'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col pb-24 md:pb-0">
            {isOutOfStock && (
              <span className="inline-block bg-red-600 text-gray-900 text-xs font-bold px-3 py-1 rounded-full w-max mb-4">
                Out of Stock
              </span>
            )}
            
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <p className="text-gray-500 text-lg mb-6">{product.unit}</p>
            
            <div className="flex items-end gap-4 mb-8">
              <span className="text-4xl font-extrabold text-gray-900">${product.price.toFixed(2)}</span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-xl text-gray-400 line-through mb-1">${product.compareAtPrice.toFixed(2)}</span>
              )}
            </div>

            <p className="text-gray-600 leading-relaxed mb-8">
              {product.description || "No description available for this product."}
            </p>

            {/* Add to Cart Actions */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-safe z-40 md:static md:border-t md:border-gray-100 md:p-0 md:mt-auto md:pt-8 md:bg-transparent">
              {quantityInCart > 0 && (
                <div className="hidden md:flex items-center gap-2 text-green-600 font-medium mb-4">
                  <Check size={20} /> {quantityInCart} currently in your cart
                </div>
              )}
              
              <div className="flex gap-3 md:gap-4">
                <div className="flex items-center justify-between border border-gray-300 rounded-xl px-2 md:px-4 py-2 md:py-3 w-28 md:w-40 h-[56px] flex-shrink-0">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="text-gray-500 hover:text-green-600 disabled:opacity-50 min-h-[44px] min-w-[32px] flex items-center justify-center"
                    disabled={quantity <= 1 || isOutOfStock}
                  >
                    <Minus size={20} />
                  </button>
                  <span className="font-bold text-lg">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="text-gray-500 hover:text-green-600 disabled:opacity-50 min-h-[44px] min-w-[32px] flex items-center justify-center"
                    disabled={isOutOfStock || (quantityInCart + quantity) >= product.stock}
                  >
                    <Plus size={20} />
                  </button>
                </div>
                
                <button 
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`flex-1 flex items-center justify-center gap-2 h-[56px] rounded-xl font-bold text-lg transition-colors ${
                    isOutOfStock 
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                      : 'bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg'
                  }`}
                >
                  <ShoppingCart size={24} />
                  <span className="truncate">{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProductsData?.data && relatedProductsData.data.length > 1 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">You might also like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {relatedProductsData.data
              .filter((p: any) => p.id !== product.id)
              .slice(0, 5)
              .map((p: any) => (
                <ProductCard key={p.id} product={p} />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
