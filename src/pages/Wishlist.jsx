import { useState, useEffect } from 'react';
import { ProductCard } from '@/components/shared/ProductCard.jsx';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { getBookById } from '@/lib/bookCatalog.js';
import { apiFetch } from '@/services/api.js';
import './Wishlist.css';

export function Wishlist({ wishlistItems, toggleWishlist, onAddToCart }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWishlistProducts() {
      setLoading(true);
      try {
        const response = await apiFetch('/api/books');
        let dbProducts = [];
        if (response.ok) {
          const data = await response.json();
          dbProducts = data.map((b) => ({
            ...b,
            id: b._id || b.id
          }));
        }
        
        const resolved = [];
        for (const itemId of wishlistItems) {
          const dbProd = dbProducts.find(p => p.id === itemId);
          if (dbProd) {
            resolved.push(dbProd);
          } else {
            const mockBook = getBookById(itemId);
            if (mockBook) {
              resolved.push(mockBook);
            }
          }
        }
        setProducts(resolved);
      } catch (e) {
        console.error("Error resolving wishlist products from backend:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchWishlistProducts();
  }, [wishlistItems]);

  if (loading) return <div className="wishlist-loading">Loading Wishlist...</div>;

  return (
    <div className="wishlist-page">
      <div className="wishlist-header">
        <div className="wishlist-header-icon">
          <Heart className="h-6 w-6 fill-current" />
        </div>
        <h1 className="wishlist-title">My Wishlist</h1>
      </div>

      {products.length === 0 ? (
        <div className="wishlist-empty">
          <div className="wishlist-empty-icon">
            <Heart />
          </div>
          <h2 className="wishlist-empty-title">Your wishlist is empty</h2>
          <p className="wishlist-empty-desc">Save items you love for later. They'll show up here so you don't lose track of them.</p>
          <Link to="/">
            <button className="wishlist-empty-btn">Start Exploring</button>
          </Link>
        </div>
      ) : (
        <div className="wishlist-grid">
          {products.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onAddToCart={onAddToCart} 
              onAddToWishlist={toggleWishlist} 
              isWishlisted={true} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
export default Wishlist;
