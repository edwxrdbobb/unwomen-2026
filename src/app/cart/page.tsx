'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import Loader from '@/components/Loader';
import { Trash } from 'lucide-react';

interface CartItem {
  id: number;
  productName: string;
  price: number;
  image: string;
  quantity: number;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load cart items from localStorage
    const items = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(items);
    setIsLoading(false);
  }, []);

  const removeFromCart = (itemId: number) => {
    const updatedCart = cartItems.filter(item => item.id !== itemId);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    toast.success('Item removed from cart');
  };

  const updateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const updatedCart = cartItems.map(item => 
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  if (isLoading) return <Loader />;

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8 text-black">Shopping Cart</h1>
      {cartItems.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-center border rounded-lg p-4 bg-white">
              <img
                src={item.image}
                alt={item.productName}
                className="w-24 h-24 object-cover rounded"
              />
              <div className="ml-4 flex-grow">
                <h3 className="font-semibold text-gray-700">{item.productName}</h3>
                <div className="flex items-center mt-2">
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="px-2 py-1 bg-gray-600 rounded"
                  >
                    -
                  </button>
                  <span className="mx-4 text-blue-400">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="px-2 py-1 bg-gray-600 rounded"
                  >
                    +
                  </button>
                </div>
                <p className="text-blue-800 font-bold mt-2">Le {item.price.toFixed(2)}</p>
              </div>
              <button
                onClick={() => removeFromCart(item.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash />
              </button>
            </div>
          ))}
          <div className="mt-8 flex justify-between items-center">
            <div className="text-xl font-bold text-black">
              Total: Le <span className="text-yellow-500 text-lg">{total.toFixed(2)}</span>
            </div>
            <button className="bg-yellow-200 text-black px-6 py-2 rounded-lg hover:bg-yellow-400">
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
