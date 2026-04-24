import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCategories } from '../hooks/useProducts';
import ProductCard from '../components/products/ProductCard';
import { Search, Apple, Coffee, Fish, Milk, ShoppingBag } from 'lucide-react';

export default function Home() {
  const { data: categories, isLoading: isCategoriesLoading } = useCategories();
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const getCategoryIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('fruit') || n.includes('veg')) return <Apple size={16} />;
    if (n.includes('meat') || n.includes('fish') || n.includes('sea')) return <Fish size={16} />;
    if (n.includes('dairy') || n.includes('milk') || n.includes('egg')) return <Milk size={16} />;
    if (n.includes('snack') || n.includes('coffee') || n.includes('drink')) return <Coffee size={16} />;
    return <ShoppingBag size={16} />;
  };

  return (
    <div className="pb-[80px] bg-gray-50 min-h-screen">
      {/* 1. Search bar */}
      <div className="px-[16px] pt-[16px]">
        <div className="w-full h-[44px] rounded-[22px] bg-gray-200 flex items-center px-[16px]">
          <Search size={20} className="text-gray-400 mr-2" />
          <input 
            type="text" 
            placeholder="Search products..." 
            className="bg-transparent border-none outline-none w-full text-[14px] text-gray-900 placeholder-gray-400"
          />
        </div>
      </div>

      {/* 2. Promo banner */}
      <div className="mt-[24px] px-[16px]">
        <div className="w-full h-[120px] rounded-[12px] overflow-hidden relative bg-green-600">
          <img 
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800" 
            alt="Promo" 
            className="w-full h-full object-cover opacity-80"
            onError={(e) => (e.currentTarget.src = '/placeholder.png')}
          />
          <div className="absolute inset-0 flex flex-col justify-center px-[16px]">
            <h2 className="text-gray-900 text-[20px] font-[700] leading-tight">Fresh Groceries<br/>Delivered Fast</h2>
          </div>
        </div>
      </div>

      {/* 3. Category pills row */}
      <div className="mt-[24px]">
        <div className="flex overflow-x-auto gap-[8px] px-[16px] scrollbar-hide">
          <button
            onClick={() => setActiveCategory('all')}
            className={`flex-shrink-0 flex items-center gap-[6px] h-[36px] px-[16px] rounded-full text-[13px] font-[600] border transition-colors ${
              activeCategory === 'all' 
                ? 'bg-green-600 text-white border-green-600' 
                : 'bg-white text-gray-500 border-gray-200'
            }`}
          >
            All
          </button>
          {categories?.map((cat: any) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-shrink-0 flex items-center gap-[6px] h-[36px] px-[16px] rounded-full text-[13px] font-[600] border transition-colors ${
                activeCategory === cat.id 
                  ? 'bg-green-600 text-white border-green-600' 
                  : 'bg-white text-gray-500 border-gray-200'
              }`}
            >
              {getCategoryIcon(cat.name)}
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Per-category product rows */}
      <div className="mt-[24px] flex flex-col gap-[24px]">
        {isCategoriesLoading ? (
          <div className="px-[16px] text-gray-500">Loading...</div>
        ) : (
          (categories || []).filter((c: any) => activeCategory === 'all' || c.id === activeCategory).map((category: any) => (
            category.products && category.products.length > 0 && (
              <div key={category.id}>
                {/* Section header */}
                <div className="px-[16px] flex justify-between items-center">
                  <h2 className="text-[18px] font-[700] text-gray-900">{category.name}</h2>
                  <Link to={`/category/${category.slug}`} className="text-[13px] text-green-600 font-[600]">
                    View All
                  </Link>
                </div>
                
                {/* Scroll container */}
                <div className="flex overflow-x-auto gap-[12px] px-[16px] py-[12px] scrollbar-hide">
                  {category.products.map((product: any) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            )
          ))
        )}
      </div>
    </div>
  );
}
