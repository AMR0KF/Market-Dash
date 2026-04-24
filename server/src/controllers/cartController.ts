import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../prisma';

export const getCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, price: true, images: true, stock: true, unit: true }
            }
          }
        }
      }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: { items: { include: { product: true } } }
      });
    }

    const parsedCart = {
      ...cart,
      items: cart.items.map(item => ({
        ...item,
        product: {
          ...item.product,
          images: item.product.images ? JSON.parse(item.product.images as any) : []
        }
      }))
    };

    res.status(200).json({ success: true, message: 'Cart retrieved', data: parsedCart });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

export const addToCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { productId, quantity } = req.body;

    if (!productId || !quantity || quantity <= 0) {
      res.status(400).json({ success: false, message: 'Invalid product or quantity', data: null });
      return;
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found', data: null });
      return;
    }

    let cart = await prisma.cart.findUnique({ where: { userId }, include: { items: true } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId }, include: { items: true } });
    }

    const existingItem = cart.items.find(item => item.productId === productId);
    const newQuantity = existingItem ? existingItem.quantity + quantity : quantity;

    if (product.stock < newQuantity) {
      res.status(400).json({ success: false, message: 'Insufficient stock', data: null });
      return;
    }

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity }
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity }
      });
    }

    res.status(200).json({ success: true, message: 'Item added to cart', data: null });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

export const updateCartItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { cartItemId } = req.params;
    const { quantity } = req.body;

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true, product: true }
    });

    if (!cartItem || cartItem.cart.userId !== userId) {
      res.status(404).json({ success: false, message: 'Cart item not found', data: null });
      return;
    }

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: cartItemId } });
      res.status(200).json({ success: true, message: 'Item removed from cart', data: null });
      return;
    }

    if (cartItem.product.stock < quantity) {
      res.status(400).json({ success: false, message: 'Insufficient stock', data: null });
      return;
    }

    await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity }
    });

    res.status(200).json({ success: true, message: 'Cart item updated', data: null });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

export const removeFromCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { cartItemId } = req.params;

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true }
    });

    if (!cartItem || cartItem.cart.userId !== userId) {
      res.status(404).json({ success: false, message: 'Cart item not found', data: null });
      return;
    }

    await prisma.cartItem.delete({ where: { id: cartItemId } });

    res.status(200).json({ success: true, message: 'Item removed from cart', data: null });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

export const clearCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      res.status(200).json({ success: true, message: 'Cart is already empty', data: null });
      return;
    }

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    res.status(200).json({ success: true, message: 'Cart cleared', data: null });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

export const getCartSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } }
    });

    let subtotal = 0;
    let itemCount = 0;

    if (cart && cart.items) {
      cart.items.forEach(item => {
        subtotal += item.quantity * item.product.price;
        itemCount += item.quantity;
      });
    }

    const estimatedDeliveryFee = subtotal >= 50000 ? 0 : (subtotal > 0 ? 5000 : 0);
    const estimatedTotal = subtotal + estimatedDeliveryFee;

    res.status(200).json({
      success: true,
      message: 'Cart summary retrieved',
      data: {
        itemCount,
        subtotal,
        estimatedDeliveryFee,
        estimatedTotal
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};
