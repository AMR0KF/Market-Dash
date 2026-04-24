import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useCategory, useProducts } from '../hooks/useProducts';
import ProductCard from '../components/products/ProductCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Parse filters from URL
  const page = parseInt(searchParams.get('page') || '1', 10);
  const inStock = searchParams.get('inStock') === 'true';
  const sort = searchParams.get('sort') || 'popular';

  const { data: category, isLoading: isCategoryLoading } = useCategory(slug || '');
  
  const { data: productsData, isLoading: isProductsLoading } = useProducts({
    category: category?.id,
    page,
    limit: 12,
    inStock: inStock ? true : undefined,
  });

  const handleFilterChange = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === null) {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  if (isCategoryLoading) {
    return <div className="px-[16px] py-[24px] text-gray-500">Loading...</div>;
  }

  if (!category) {
    return <div className="px-[16px] py-[24px] text-[18px] font-[700] text-gray-900">Category not found</div>;
  }

  return (
    <div className="pb-[80px] bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="px-[16px] pt-[16px] pb-[12px] bg-white border-b border-gray-200">
        <h1 className="text-[18px] font-[700] text-gray-900">{category.name}</h1>
      </div>

      {/* Filter Chips */}
      <div className="bg-white border-b border-gray-200 py-[12px]">
        <div className="flex overflow-x-auto gap-[8px] px-[16px] scrollbar-hide">
          <button
            onClick={() => handleFilterChange('sort', sort === 'popular' ? null : 'popular')}
            className={`flex-shrink-0 h-[32px] px-[16px] rounded-full text-[13px] font-[600] border transition-colors ${
              sort === 'popular' 
                ? 'bg-green-600 text-white border-green-600' 
                : 'bg-white text-gray-500 border-gray-200'
            }`}
          >
            Popular
          </button>
          <button
            onClick={() => handleFilterChange('sort', sort === 'price_low' ? null : 'price_low')}
            className={`flex-shrink-0 h-[32px] px-[16px] rounded-full text-[13px] font-[600] border transition-colors ${
              sort === 'price_low' 
                ? 'bg-green-600 text-white border-green-600' 
                : 'bg-white text-gray-500 border-gray-200'
            }`}
          >
            Price: Low to High
          </button>
          <button
            onClick={() => handleFilterChange('inStock', inStock ? null : 'true')}
            className={`flex-shrink-0 h-[32px] px-[16px] rounded-full text-[13px] font-[600] border transition-colors ${
              inStock 
                ? 'bg-green-600 text-white border-green-600' 
                : 'bg-white text-gray-500 border-gray-200'
            }`}
          >
            In Stock Only
          </button>
        </div>
      </div>

      {/* Product Grid */}
      <div className="mt-[24px]">
        {isProductsLoading ? (
          <div className="px-[16px] text-gray-500">Loading products...</div>
        ) : productsData?.data?.length === 0 ? (
          <div className="px-[16px] text-center py-[40px]">
            <h3 className="text-[16px] font-[600] text-gray-900">No products found</h3>
            <p className="text-[14px] text-gray-500 mt-[4px]">Try adjusting your filters.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-[12px] px-[16px] justify-items-center">
              {productsData?.data?.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {productsData?.totalPages > 1 && (
              <div className="flex justify-center items-center gap-[16px] mt-[32px] px-[16px]">
                <button 
                  disabled={page === 1}
                  onClick={() => handleFilterChange('page', (page - 1).toString())}
                  className="w-[44px] h-[44px] rounded-full border border-gray-200 bg-white disabled:opacity-50 flex items-center justify-center text-gray-900"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-[14px] font-[600] text-gray-900">
                  Page {page} of {productsData.totalPages}
                </span>
                <button 
                  disabled={page === productsData.totalPages}
                  onClick={() => handleFilterChange('page', (page + 1).toString())}
                  className="w-[44px] h-[44px] rounded-full border border-gray-200 bg-white disabled:opacity-50 flex items-center justify-center text-gray-900"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
