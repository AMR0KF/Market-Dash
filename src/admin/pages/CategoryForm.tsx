import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Save, Loader2, UploadCloud, X } from 'lucide-react';
import api from '../../api';

const categorySchema = z.object({
  name: z.string().min(2, 'Name is required'),
  slug: z.string().min(2, 'Slug is required'),
  description: z.string().optional(),
  parentId: z.string().optional().nullable(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

export default function CategoryForm() {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const [image, setImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      parentId: null,
    }
  });

  const nameValue = watch('name');

  // Auto-generate slug from name if not manually edited
  useEffect(() => {
    if (!isEditMode && nameValue) {
      const generatedSlug = nameValue
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setValue('slug', generatedSlug, { shouldValidate: true });
    }
  }, [nameValue, isEditMode, setValue]);

  const { data: categories } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/categories');
        return data.data;
      } catch (error) {
        return [];
      }
    }
  });

  useEffect(() => {
    if (isEditMode) {
      const fetchCategory = async () => {
        try {
          const { data } = await api.get(`/categories/${id}`);
          const c = data.data;
          reset({
            name: c.name,
            slug: c.slug,
            description: c.description || '',
            parentId: c.parentId || null,
          });
          if (c.image) setImage(c.image);
        } catch (err) {
          setError('Failed to load category details');
        }
      };
      fetchCategory();
    }
  }, [id, isEditMode, reset]);

  const onSubmit = async (data: CategoryFormData) => {
    setIsSaving(true);
    setError('');

    try {
      const payload = {
        ...data,
        parentId: data.parentId === '' ? null : data.parentId,
        image
      };

      if (isEditMode) {
        await api.put(`/categories/${id}`, payload);
      } else {
        await api.post('/categories', payload);
      }
      
      navigate('/admin/categories');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save category');
      setIsSaving(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(URL.createObjectURL(file));
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/categories')} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Edit Category' : 'Add New Category'}
            </h1>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            type="button" 
            onClick={() => navigate('/admin/categories')}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit(onSubmit)}
            disabled={isSaving}
            className="px-4 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Category
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <form className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input {...register('name')} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <input {...register('slug')} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-gray-50" />
            {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category (Optional)</label>
          <select {...register('parentId')} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-white">
            <option value="">None (Root Category)</option>
            {(categories || []).filter((c: any) => c.id !== id).map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea {...register('description')} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none resize-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category Image</label>
          {image ? (
            <div className="relative w-40 h-40 rounded-xl border border-gray-200 overflow-hidden group">
              <img src={image} alt="Category" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-white/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => setImage(null)}
                  className="p-2 bg-white text-red-600 rounded-lg hover:bg-red-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="relative w-full sm:w-64 h-40 border-2 border-dashed border-gray-300 rounded-xl hover:border-gray-400 bg-gray-50 transition-colors">
              <input
                type="file"
                onChange={handleImageUpload}
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm font-medium text-gray-600">Upload Image</span>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
