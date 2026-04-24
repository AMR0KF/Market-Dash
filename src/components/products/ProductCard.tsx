import { Plus, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';

interface Product {
  id: string;
  name: string;
  price: number;
  compareAtPrice?: number | null;
  images: string[];
  stock: number;
  unit: string;
  category?: { name: string };
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { items, handleAddItem, handleUpdateItem } = useCart();
  
  const cartItem = items.find(item => item.productId === product.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;
  const isOutOfStock = product.stock <= 0;
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <div className="w-[160px] flex-shrink-0 bg-white rounded-[12px] border border-gray-200 overflow-hidden flex flex-col shadow-sm">
      <Link to={`/product/${product.id}`} className="block w-full aspect-square bg-gray-100 relative overflow-hidden">
        <img 
          src={product.images?.[0] || '/placeholder.png'} 
          alt={product.name} 
          onError={(e) => (e.currentTarget.src = '/placeholder.png')}
          className="w-full h-full object-cover"
        />
        {hasDiscount && (
          <div className="absolute top-[8px] left-[8px] bg-red-600 text-gray-900 text-[11px] font-[600] px-[6px] py-[2px] rounded-[4px]">
            Sale
          </div>
        )}
      </Link>

      <div className="p-[8px] flex flex-col flex-1">
        <Link to={`/product/${product.id}`}>
          <h3 className="text-[14px] font-[600] text-gray-900 line-clamp-2 min-h-[40px] leading-tight">
            {product.name}
          </h3>
        </Link>
        
        <p className="text-[12px] font-[400] text-gray-500 mt-[2px]">
          {product.unit}
        </p>
        
        <div className="mt-[8px] flex items-center justify-between">
          <div className="flex flex-col justify-center">
            <span className="text-[16px] font-[700] text-gray-900 leading-none">
              ${product.price.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-[12px] text-gray-400 line-through leading-none mt-[2px]">
                ${product.compareAtPrice!.toFixed(2)}
              </span>
            )}
          </div>

          {quantityInCart > 0 ? (
            <div className="flex items-center bg-green-50 rounded-full h-[32px] px-[4px]">
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  handleUpdateItem(cartItem!.id, quantityInCart - 1);
                }}
                className="w-[24px] h-[24px] flex items-center justify-center text-green-600"
              >
                <Minus size={16} strokeWidth={3} />
              </button>
              <span className="text-[13px] font-[600] text-green-600 min-w-[16px] text-center">
                {quantityInCart}
              </span>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  handleUpdateItem(cartItem!.id, quantityInCart + 1);
                }}
                disabled={isOutOfStock || quantityInCart >= product.stock}
                className="w-[24px] h-[24px] flex items-center justify-center text-green-600 disabled:opacity-50"
              >
                <Plus size={16} strokeWidth={3} />
              </button>
            </div>
          ) : (
            <button 
              onClick={(e) => {
                e.preventDefault();
                handleAddItem(product.id, 1);
              }}
              disabled={isOutOfStock}
              className="w-[32px] h-[32px] rounded-full bg-green-50 text-green-600 flex items-center justify-center disabled:opacity-50 disabled:bg-gray-100 disabled:text-gray-400"
            >
              <Plus size={20} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
