import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/context/AuthProvider';
import { Navbar } from '@/components/layout/Navbar';
import { Home } from './pages/Home';
import { ProductDetail } from './pages/ProductDetail';
import { Categories } from './pages/Categories';
import { About } from './pages/About';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Profile } from './pages/Profile';
import { AdminDashboard } from './pages/AdminDashboard';
import { Wishlist } from './pages/Wishlist';
import Authors from './pages/Authors';
import { EQuran } from './pages/EQuran';
import { Payment } from './pages/Payment';

import { ShoppingCart, Heart, User, Search, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function App() {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  // Load cart and wishlist from localStorage initially
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
  }, []);

  // Save to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [cart, wishlist]);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        toast.success(`Increased quantity of ${product.name}`);
        return prev.map((item) =>
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      toast.success(`Added ${product.name} to cart`);
      return [...prev, { productId: product.id, quantity: 1, product }];
    });
  };

  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      if (prev.includes(product.id)) {
        toast.info(`Removed ${product.name} from wishlist`);
        return prev.filter((id) => id !== product.id);
      }
      toast.success(`Added ${product.name} to wishlist`);
      return [...prev, product.id];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const updateQuantity = (productId, delta) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => setCart([]);

  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
          <Navbar cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)} />
          <main>
            <Routes>
              <Route path="/" element={<Home onAddToCart={addToCart} onAddToWishlist={toggleWishlist} wishlist={wishlist} />} />
              <Route path="/product/:id" element={<ProductDetail onAddToCart={addToCart} onAddToWishlist={toggleWishlist} isWishlisted={false} wishlist={wishlist} />} />
              <Route path="/categories" element={<Categories onAddToCart={addToCart} onAddToWishlist={toggleWishlist} wishlist={wishlist} />} />
              <Route path="/categories/:lang" element={<Categories onAddToCart={addToCart} onAddToWishlist={toggleWishlist} wishlist={wishlist} />} />
              <Route path="/categories/:lang/:catId" element={<Categories onAddToCart={addToCart} onAddToWishlist={toggleWishlist} wishlist={wishlist} />} />
              <Route path="/about" element={<About />} />
              <Route path="/cart" element={<Cart cart={cart} removeFromCart={removeFromCart} updateQuantity={updateQuantity} clearCart={clearCart} />} />
              <Route path="/checkout" element={<Checkout cart={cart} clearCart={clearCart} />} />
              <Route path="/payment/:orderId" element={<Payment cart={cart} clearCart={clearCart} />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/wishlist" element={<Wishlist wishlistItems={wishlist} toggleWishlist={toggleWishlist} onAddToCart={addToCart} />} />
              <Route path="/authors" element={<Authors />} />
              <Route path="/equran" element={<EQuran />} />
            </Routes>
          </main>
          <Toaster position="bottom-right" />
          <footer className="border-t py-12 bg-muted/30">
            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <img src="/assets/logo.png" alt="IFT Chennai Logo" className="h-20 w-auto max-w-[300px] object-contain animate-fade-in" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Islamic Foundation Trust (IFT) Chennai — pioneer in publishing authentic Islamic translations and literature since 1973.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Publications</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>Tamil Books</li>
                  <li>English Books</li>
                  <li>Arabic Publications</li>
                  <li>Urdu Literature</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>Shipping Info</li>
                  <li>Returns & Refunds</li>
                  <li>Order Tracking</li>
                  <li>Contact Us</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Newsletter</h4>
                <p className="text-sm text-muted-foreground mb-4">Subscribe for updates and low-stock alerts.</p>
                <div className="flex gap-2">
                  <input className="bg-background border h-9 px-3 rounded flex-1 outline-none" placeholder="Email address" />
                  <Button size="sm">Join</Button>
                </div>
              </div>
            </div>
            <div className="container mx-auto px-4 mt-12 pt-8 border-t text-center text-xs text-muted-foreground">
              © {new Date().getFullYear()} Islamic Foundation Trust (IFT) Chennai. All rights reserved. Secure transactions powered by IFT Gateway.
            </div>
          </footer>
        </div>
      </AuthProvider>
    </Router>
  );
}
