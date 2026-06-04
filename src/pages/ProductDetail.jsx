import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, ShoppingCart, Heart, Truck, ShieldCheck, ChevronRight, Share2, MessageSquare } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductCard } from '@/components/shared/ProductCard.jsx';
import { motion, AnimatePresence } from 'motion/react';
import { getBookById, FEATURED_BOOKS } from '@/lib/bookCatalog.js';
import { apiFetch } from '@/services/api.js';
import './ProductDetail.css';

export function ProductDetail({ onAddToCart, onAddToWishlist, wishlist }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      setLoading(true);
      try {
        const response = await apiFetch(`/api/books/${id}`);
        if (response.ok) {
          const bookData = await response.json();
          const productData = {
            ...bookData,
            id: bookData._id || bookData.id
          };
          setProduct(productData);
          setReviews([]);
          fetchRecommendations(productData);
        } else {
          const mockBook = getBookById(id);
          if (mockBook) {
            setProduct(mockBook);
            fetchRecommendations(mockBook);
          }
        }
      } catch (error) {
        console.error("Error fetching product from MongoDB:", error);
        const mockBook = getBookById(id);
        if (mockBook) {
          setProduct(mockBook);
          fetchRecommendations(mockBook);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  async function fetchRecommendations(current) {
    try {
      let recs = [];
      try {
        const response = await apiFetch('/api/books?limit=5');
        if (response.ok) {
          const data = await response.json();
          recs = data
            .map((b) => ({ ...b, id: b._id || b.id }))
            .filter((p) => p.id !== current.id)
            .slice(0, 4);
        }
      } catch (dbErr) {
        console.error("API recommendation fetch failed, using mock catalog:", dbErr);
      }

      if (recs.length === 0) {
        recs = FEATURED_BOOKS.filter(p => p.id !== current.id).slice(0, 4);
      }
      setRecommendations(recs);
    } catch (e) {
      console.error(e);
      const fallback = FEATURED_BOOKS.filter(p => p.id !== current.id).slice(0, 4);
      setRecommendations(fallback);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
        <Skeleton className="aspect-square w-full rounded-2xl" />
        <div className="space-y-6">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (!product) return <div className="p-20 text-center">Product not found.</div>;

  return (
    <div className="pd-page">
      <div className="pd-breadcrumbs">
        <Link to="/">Home</Link>
        <ChevronRight className="h-4 w-4" />
        <Link to={`/categories/${product.category.toLowerCase()}`}>{product.category}</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="active">{product.name}</span>
      </div>

      <div className="pd-grid">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }}
          className="pd-image-wrapper"
        >
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="pd-image"
            referrerPolicy="no-referrer"
          />
          <span className="pd-image-badge">
            {product.category}
          </span>
          <button className="pd-image-action-btn">
            <Share2 className="h-4 w-4" />
          </button>
        </motion.div>

        <div className="pd-info-wrapper">
          <div>
            <div className="pd-rating-row">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : ''}`} />
              ))}
              <span>{product.rating}</span>
              <span className="pd-rating-count">({product.reviewCount} customer reviews)</span>
            </div>
            <h1 className="pd-title">{product.name}</h1>
            <p className="pd-price">₹{product.price.toFixed(2)}</p>
          </div>

          <p className="pd-description">
            {product.description || "Authentic publication by Islamic Foundation Trust (IFT) Chennai."}
          </p>

          <div className="pd-metadata-card">
            <h3>📖 About the Book</h3>
            
            <div className="pd-metadata-grid">
              <div className="pd-metadata-item">
                <span className="label">Author</span>
                <span className="val">{product.author || 'IFT Scholar'}</span>
              </div>
              <div className="pd-metadata-item">
                <span className="label">Published</span>
                <span className="val">{product.price > 350 ? '2024' : '2025'}</span>
              </div>
              <div className="pd-metadata-item">
                <span className="label">Language</span>
                <span className="val">{product.category.split(' ')[0]}</span>
              </div>
              <div className="pd-metadata-item">
                <span className="label">Availability</span>
                <span className="val" style={{ color: product.stock > 0 ? '#16a34a' : '#dc2626' }}>
                  {product.stock > 0 ? `${product.stock} Copies In Stock` : 'Out of Stock'}
                </span>
              </div>
            </div>

            <div className="pd-metadata-summary">
              <span className="label">Book Synopsis</span>
              <p>
                {product.description || "An authentic publication by Islamic Foundation Trust (IFT) Chennai. This book is crafted with extreme care, featuring scholarly translations, commentaries, and moral lessons to guide the reader towards deeper spiritual values, character building, and authentic knowledge."}
              </p>
            </div>
          </div>

          <Separator className="my-2" />

          <div className="space-y-4">
            <div className="pd-actions-row">
              <div className="pd-qty-selector">
                <button 
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                >
                  -
                </button>
                <span>{quantity}</span>
                <button 
                  onClick={() => setQuantity(prev => prev + 1)}
                >
                  +
                </button>
              </div>
              <button className="pd-cart-btn" onClick={() => onAddToCart(product)}>
                <ShoppingCart className="h-5 w-5" /> Add to Cart
              </button>
              <button 
                className={`pd-wishlist-btn ${wishlist.includes(product.id) ? 'active' : ''}`} 
                onClick={() => onAddToWishlist(product)}
              >
                <Heart className={wishlist.includes(product.id) ? 'fill-current' : ''} />
              </button>
            </div>

            <div className="pd-badges-row">
              {product.stock > 0 ? (
                <span className={`pd-status-badge ${product.stock <= 4 ? 'low-stock' : 'in-stock'}`}>
                  {product.stock <= 4 ? `⚠️ Low Stock (${product.stock} available)` : `✔️ In Stock (${product.stock} available)`}
                </span>
              ) : (
                <span className="pd-status-badge out-of-stock">
                  ❌ Out of Stock
                </span>
              )}

              {product.rating >= 4.6 && (
                <span className="pd-editor-badge">
                  🏆 Editor's Choice
                </span>
              )}
            </div>
          </div>

          <div className="pd-features-grid">
            <div className="pd-feature-box">
              <Truck />
              <div>
                <p className="title">Fast Shipping</p>
                <p className="val">2-4 Business Days</p>
              </div>
            </div>
            <div className="pd-feature-box">
              <ShieldCheck />
              <div>
                <p className="title">Warranty</p>
                <p className="val">Genuine Publication</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="details" className="mb-20">
        <TabsList className="pd-tabs-list">
          <TabsTrigger value="details" className="pd-tabs-trigger">Product Details</TabsTrigger>
          <TabsTrigger value="reviews" className="pd-tabs-trigger">Reviews ({product.reviewCount})</TabsTrigger>
          <TabsTrigger value="shipping" className="pd-tabs-trigger">Shipping & Returns</TabsTrigger>
        </TabsList>
        <div className="pd-tabs-content">
          <TabsContent value="details" className="space-y-6">
            <div className="max-w-3xl text-left">
              <h3 className="text-2xl font-bold mb-4">Technical Specifications</h3>
              <div className="pd-spec-grid">
                {[
                  { label: 'Publisher', value: 'Islamic Foundation Trust (IFT)' },
                  { label: 'Language', value: product.category.split(' ')[0] },
                  { label: 'Binding', value: product.price > 500 ? 'Hardcover' : 'Paperback' },
                  { label: 'Edition', value: '2025 Edition' }
                ].map((spec) => (
                  <div key={spec.label} className="pd-spec-row">
                    <span className="label">{spec.label}</span>
                    <span className="val">{spec.value}</span>
                  </div>
                ))}
              </div>
              <p className="mt-8 text-muted-foreground">
                Published by IFT Chennai. This work is crafted with extreme care, with high-quality printing, authentic translations, and elegant formatting to guide readers towards deeper understanding and values.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="reviews">
            <div className="pd-reviews-layout">
              <div className="w-full md:w-1/3">
                <div className="pd-reviews-score-card">
                  <p className="label">Total Rating</p>
                  <p className="score">{product.rating}</p>
                  <div className="stars">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-5 w-5 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : ''}`} />
                    ))}
                  </div>
                  <button className="pd-cart-btn" style={{ minWidth: 'auto', height: '2.75rem' }}>Write a Review</button>
                </div>
              </div>
              
              <div className="pd-reviews-list">
                {reviews.length === 0 ? (
                  <div className="pd-review-empty">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4" />
                    <p>No reviews yet. Be the first to share your experience!</p>
                  </div>
                ) : (
                  reviews.map(review => (
                    <div key={review.id} className="pd-review-item">
                      <div className="pd-review-item-header">
                        <div>
                          <p className="pd-review-item-author">{review.userName}</p>
                          <div className="pd-review-item-stars">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'text-yellow-400 fill-current' : ''}`} />
                            ))}
                          </div>
                        </div>
                        <span className="pd-review-item-date">{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="pd-review-item-comment">{review.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="shipping">
            <div className="max-w-2xl space-y-4 text-left">
              <h3 className="text-2xl font-bold">Standard Shipping</h3>
              <p className="text-muted-foreground">Continental US: 3-5 business days. International shipping available.</p>
              <h3 className="text-2xl font-bold mt-8">Returns</h3>
              <p className="text-muted-foreground">30-day no-questions-asked returns for unopened products.</p>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {recommendations.length > 0 && (
        <section className="pd-recs-section">
          <div className="pd-recs-header">
            <h2>You May Also Like</h2>
            <Link to="/categories">
              View more <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="pd-recs-grid">
            {recommendations.map(p => (
              <ProductCard 
                key={p.id} 
                product={p} 
                onAddToCart={onAddToCart} 
                onAddToWishlist={onAddToWishlist} 
                isWishlisted={wishlist.includes(p.id)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
export default ProductDetail;
