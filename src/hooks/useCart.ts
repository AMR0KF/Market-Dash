import { useCartStore } from '../store/cartStore';
import { useUiStore } from '../store/uiStore';

export const useCart = () => {
  const cartStore = useCartStore();
  const { showNotification } = useUiStore();

  const handleAddItem = async (productId: string, quantity: number = 1) => {
    try {
      await cartStore.addItem(productId, quantity);
      showNotification('Added to cart', 'success');
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Failed to add to cart', 'error');
    }
  };

  const handleUpdateItem = async (cartItemId: string, quantity: number) => {
    try {
      await cartStore.updateItem(cartItemId, quantity);
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Failed to update cart', 'error');
    }
  };

  const handleRemoveItem = async (cartItemId: string) => {
    try {
      await cartStore.removeItem(cartItemId);
      showNotification('Item removed from cart', 'info');
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Failed to remove item', 'error');
    }
  };

  const handleClearCart = async () => {
    try {
      await cartStore.clearCart();
      showNotification('Cart cleared', 'info');
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Failed to clear cart', 'error');
    }
  };

  return {
    ...cartStore,
    handleAddItem,
    handleUpdateItem,
    handleRemoveItem,
    handleClearCart,
  };
};
