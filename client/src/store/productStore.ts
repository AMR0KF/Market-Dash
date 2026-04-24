import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
}

interface ProductState {
  products: Product[];
  categories: string[];
  setProducts: (products: Product[]) => void;
}

// Initial mock data based on our supermarket theme
const INITIAL_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Organic Bananas', description: 'Fresh organic bananas', price: 2.99, category: 'Produce', image: '🍌' },
  { id: 'p2', name: 'Honeycrisp Apples', description: 'Crisp and sweet apples', price: 4.99, category: 'Produce', image: '🍎' },
  { id: 'p3', name: 'Baby Spinach', description: 'Pre-washed baby spinach', price: 3.49, category: 'Produce', image: '🥬' },
  { id: 'd1', name: 'Whole Milk', description: '1 Gallon Whole Milk', price: 3.99, category: 'Dairy', image: '🥛' },
  { id: 'd2', name: 'Large Brown Eggs', description: 'Dozen free-range eggs', price: 5.49, category: 'Dairy', image: '🥚' },
  { id: 'd3', name: 'Cheddar Cheese', description: 'Sharp cheddar cheese block', price: 6.99, category: 'Dairy', image: '🧀' },
  { id: 'm1', name: 'Chicken Breast', description: 'Boneless skinless', price: 9.99, category: 'Meat', image: '🍗' },
  { id: 'm2', name: 'Bacon', description: 'Thick cut smoked bacon', price: 8.99, category: 'Meat', image: '🥓' },
  { id: 'b1', name: 'Sourdough Loaf', description: 'Fresh baked artisan sourdough', price: 5.99, category: 'Bakery', image: '🍞' },
  { id: 'b2', name: 'Butter Croissants', description: 'Pack of 4 butter croissants', price: 4.99, category: 'Bakery', image: '🥐' },
];

const INITIAL_CATEGORIES = ['All', 'Produce', 'Dairy', 'Meat', 'Bakery'];

export const useProductStore = create<ProductState>()(
  persist(
    (set) => ({
      products: INITIAL_PRODUCTS,
      categories: INITIAL_CATEGORIES,
      setProducts: (products) => set({ products }),
    }),
    {
      name: 'marketdash-products',
    }
  )
);
