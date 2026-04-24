import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Edit, Trash2, Loader2, Image as ImageIcon, Package } from 'lucide-react';
import api from '../../api';
import EmptyState from '../../components/ui/EmptyState';
import ErrorBoundary from '../../components/ui/ErrorBoundary';

function ProductListContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: productsData, isLoading, isError } = useQuery({
    queryKey: ['admin-products', searchTerm, categoryFilter, statusFilter],
    queryFn: async () => {
      try {
        const { data } = await api.get('/products', {
          params: { search: searchTerm, category: categoryFilter, status: statusFilter }
        });
        return data.data;
      } catch (error) {
        // Mock fallback
        return [
          { id: '1', name: 'Organic Bananas', sku: 'PROD-BANANA-01', category: { name: 'Produce' }, price: 2.99, stock: 150, isFeatured: true, images: '["https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&w=800&q=80"]' },
          { id: '2', name: 'Red Apples', sku: 'PROD-APPLE-01', category: { name: 'Produce' }, price: 4.50, stock: 4, isFeatured: true, images: '["https://images.unsplash.com/photo-1560806887-1e4cd0b6fac6?auto=format&fit=crop&w=800&q=80"]' },
          { id: '3', name: 'Whole Milk', sku: 'DAIRY-MILK-01', category: { name: 'Dairy' }, price: 3.49, stock: 15, isFeatured: false, images: '[]' },
        ];
      }
    }
  });

  const { data: categories } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/categories');
        return data.data;
      } catch (error) {
        return [{ id: '1', name: 'Produce' }, { id: '2', name: 'Dairy' }];
      }
    }
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${id}`);
        // In a real app, invalidate query here
        alert('Product deleted');
      } catch (error) {
        alert('Failed to delete product');
      }
    }
  };

  const getStockColor = (stock: number) => {
    if (stock <= 5) return 'text-red-600 font-bold';
    if (stock <= 20) return 'text-amber-600 font-bold';
    return 'text-gray-600';
  };

  if (isError) {
    throw new Error('Failed to load products');
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 mt-1">Manage your store inventory</p>
        </div>
        <Link
          to="/admin/products/new"
          className="bg-green-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-green-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add New Product
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>
        <div className="flex gap-4">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-white min-w-[150px]"
          >
            <option value="">All Categories</option>
            {categories?.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-white min-w-[120px]"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          </div>
        ) : productsData?.length === 0 ? (
          <EmptyState
            icon={<Package className="w-8 h-8" />}
            title="No products found"
            description="Try adjusting your search or filters, or add a new product."
            actionText="Add New Product"
            actionTo="/admin/products/new"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-medium">Product</th>
                  <th className="px-6 py-4 font-medium">SKU</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Price</th>
                  <th className="px-6 py-4 font-medium">Stock</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {productsData?.map((product: any) => {
                  let images = [];
                  try {
                    images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
                  } catch (e) {}
                  const imageUrl = images?.[0];

                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {imageUrl ? (
                              <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <span className="font-medium text-gray-900">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{product.sku}</td>
                      <td className="px-6 py-4 text-gray-500">{product.category?.name || '-'}</td>
                      <td className="px-6 py-4 font-medium">${product.price.toFixed(2)}</td>
                      <td className={`px-6 py-4 ${getStockColor(product.stock)}`}>
                        {product.stock}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/products/${product.id}/edit`}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination (Mock) */}
        {productsData?.length > 0 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
            <span>Showing 1 to {productsData.length} entries</span>
            <div className="flex gap-1">
              <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50" disabled>Prev</button>
              <button className="px-3 py-1 bg-green-600 text-white rounded">1</button>
              <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductList() {
  return (
    <ErrorBoundary>
      <ProductListContent />
    </ErrorBoundary>
  );
}
