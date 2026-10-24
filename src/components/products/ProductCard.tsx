import React, { useState, useEffect } from 'react';
import { Plus, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../../hooks/useCart';
import { formatQuantityDisplay } from '../../utils/format';

interface Product {
  id: string;
  name: string;
  price: number;
  compareAtPrice?: number | null;
  images: string[];
  stock: number;
  unit: string;
  minQuantity?: number;
  stepQuantity?: number;
  category?: { name: string };
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { items, handleAddItem, handleUpdateItem, isPending } = useCart();
  
  const cartItem = items.find(item => item.productId === product.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;
  
  const [optimisticQty, setOptimisticQty] = useState<number | null>(null);

  // Sync optimistic quantity when cart item quantity updates from server
  useEffect(() => {
    setOptimisticQty(null);
  }, [quantityInCart]);

  const displayQty = optimisticQty !== null ? optimisticQty : quantityInCart;
  const isOutOfStock = product.stock <= 0;
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const isItemPending = isPending(product.id) || (cartItem ? isPending(cartItem.id) : false);

  const minQty = product.minQuantity || 1;
  const stepQty = product.stepQuantity || 1;

  const handlePlus = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isItemPending) return;
    if (displayQty === 0) {
      setOptimisticQty(minQty);
      handleAddItem(product.id, minQty);
    } else {
      const nextQty = Number((displayQty + stepQty).toFixed(2));
      setOptimisticQty(nextQty);
      if (cartItem) handleUpdateItem(cartItem.id, nextQty);
    }
  };

  const handleMinus = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isItemPending) return;
    const nextQty = Number((displayQty - stepQty).toFixed(2));
    const finalQty = nextQty < minQty - 0.001 ? 0 : nextQty;
    setOptimisticQty(finalQty);
    if (cartItem) handleUpdateItem(cartItem.id, finalQty);
  };

  return (
    <div className="w-[165px] flex-shrink-0 bg-white rounded-[12px] border border-gray-200 overflow-hidden flex flex-col shadow-sm">
      <Link to={`/product/${product.id}`} className="block w-full aspect-square bg-gray-100 relative overflow-hidden">
        <img 
          src={product.images?.[0] || '/placeholder.png'} 
          alt={product.name} 
          onError={(e) => (e.currentTarget.src = '/placeholder.png')}
          className="w-full h-full object-cover"
        />
        {hasDiscount && (
          <div className="absolute top-[8px] left-[8px] bg-rose-500 text-white text-[10px] font-[800] px-[7px] py-[2px] rounded-full shadow-sm tracking-wide uppercase">
            Sale
          </div>
        )}
      </Link>

      <div className="p-[8px] flex flex-col flex-1 justify-between">
        <div>
          <Link to={`/product/${product.id}`}>
            <h3 className="text-[14px] font-[600] text-gray-900 line-clamp-2 min-h-[40px] leading-tight">
              {product.name}
            </h3>
          </Link>
          
          <p className="text-[12px] font-[400] text-gray-500 mt-[2px]">
            {product.unit}
          </p>
        </div>
        
        <div className="mt-[8px] flex items-center justify-between gap-1 min-h-[32px]">
          <div className="flex flex-wrap items-baseline gap-x-1.5 min-w-0 flex-1 pr-1">
            <span className="text-[15px] font-[800] text-gray-900 leading-tight">
              ${product.price.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-[11px] text-gray-400 line-through leading-tight">
                ${product.compareAtPrice!.toFixed(2)}
              </span>
            )}
          </div>

          <motion.div
            layout
            initial={false}
            animate={{
              backgroundColor: displayQty > 0 ? '#121212' : '#E5C158',
            }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
            className={`relative flex items-center ${displayQty > 0 ? 'justify-between px-1.5 shadow-md shadow-black/40' : 'justify-center'} rounded-full h-[30px] p-[2px] flex-shrink-0 select-none`}
          >
            <AnimatePresence initial={false}>
              {displayQty > 0 && (
                <motion.button
                  key="minus"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.12, ease: 'easeOut' }}
                  onClick={handleMinus}
                  disabled={isItemPending}
                  className="text-[#E5C158] hover:text-yellow-600 font-bold active:scale-85 transition-transform disabled:opacity-40 flex-shrink-0 z-10 p-1 outline-none focus:outline-none focus:ring-0 focus-visible:outline-none"
                >
                  <Minus size={15} color="#E5C158" strokeWidth={3} />
                </motion.button>
              )}
            </AnimatePresence>

            <AnimatePresence initial={false}>
              {displayQty > 0 && (
                <motion.span
                  key="count"
                  initial={{ opacity: 0, scale: 0.4 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.4 }}
                  transition={{ duration: 0.1 }}
                  className="text-[13px] font-[700] text-[#E5C158] dark:text-[#E5C158] text-center whitespace-nowrap px-1.5 pointer-events-none select-none"
                >
                  {formatQuantityDisplay(displayQty, product.unit)}
                </motion.span>
              )}
            </AnimatePresence>

            <motion.button
              layout
              key="plus"
              onClick={handlePlus}
              disabled={isOutOfStock || (displayQty > 0 && displayQty >= product.stock) || isItemPending}
              className={`${displayQty > 0 ? 'text-[#E5C158] hover:text-yellow-600 p-1' : 'w-[26px] h-[26px] rounded-full bg-[#E5C158] text-gray-900 flex items-center justify-center'} font-bold active:scale-85 transition-transform disabled:opacity-40 flex-shrink-0 z-10 outline-none focus:outline-none focus:ring-0 focus-visible:outline-none`}
            >
              <Plus size={displayQty === 0 ? 15 : 15} color={displayQty === 0 ? '#121212' : '#E5C158'} strokeWidth={3} />
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
