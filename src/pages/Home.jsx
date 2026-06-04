import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '@/components/shared/ProductCard.jsx';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ShieldCheck, Truck, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Skeleton } from '@/components/ui/skeleton';
import { FEATURED_BOOKS } from '@/lib/bookCatalog.js';
import { apiFetch } from '@/services/api.js';
import './Home.css';

export function Home({ onAddToCart, onAddToWishlist, wishlist }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await apiFetch('/api/books?limit=12');
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            const mappedData = data.map((b) => ({
              ...b,
              id: b._id || b.id
            }));
            setProducts(mappedData);
          } else {
            setProducts(FEATURED_BOOKS);
          }
        } else {
          setProducts(FEATURED_BOOKS);
        }
      } catch (error) {
        console.error("Fetch error, falling back to static catalog:", error);
        setProducts(FEATURED_BOOKS);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  return (
    <div className="home-page">
      {/* Admin Testing Control Banner */}
      <div className="home-testing-portal">
        <span className="badge-portal">Testing Portal</span>
        <span className="portal-text">Secure administrative dashboard:</span>
        <div className="portal-creds">
          <span className="portal-creds-badge">Username: admin</span>
          <span className="portal-creds-badge">Password: iftadmin</span>
        </div>
        <Link to="/admin" className="portal-link">
          Launch WooCommerce Admin Portal &rarr;
        </Link>
      </div>

      {/* Hero Section */}
      <section className="home-hero">
        <div className="home-hero-bg-wrapper">
          <img 
            src="/assets/1.png" 
            alt="Hero background" 
            className="home-hero-bg-img"
          />
          <div className="home-hero-overlay"></div>
        </div>

        <div className="home-hero-content">
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="home-hero-text-block"
          >
            <span className="home-hero-badge">
              <Sparkles className="w-4 h-4 mr-2" />
              IFT Publications
            </span>
            <h1 className="home-hero-title">
              ENLIGHTEN <span>YOUR MIND</span> WITH KNOWLEDGE.
            </h1>
            <p className="home-hero-desc">
              Discover authentic Islamic literature published by Islamic Foundation Trust (IFT) Chennai in Tamil, English, Arabic, and Urdu.
            </p>
            <div className="home-hero-btn-container">
              <Link to="/categories">
                <button className="home-hero-btn">
                  Browse Publications <ArrowRight className="ml-2 w-5 h-5" />
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
        
        <div className="home-hero-accent-glow"></div>
      </section>

      {/* Features bar */}
      <section className="home-features-bar">
        <div className="home-features-container">
          <div className="home-feature-item">
            <Truck />
            <div className="home-feature-text">
              <p className="home-feature-title">Free Express Shipping</p>
              <p className="home-feature-subtitle">On orders above ₹150</p>
            </div>
          </div>
          <div className="home-feature-item">
            <ShieldCheck />
            <div className="home-feature-text">
              <p className="home-feature-title">Secure Checkout</p>
              <p className="home-feature-subtitle">SSL encrypted transactions</p>
            </div>
          </div>
          <div className="home-feature-item">
            <Sparkles />
            <div className="home-feature-text">
              <p className="home-feature-title">Trusted Translations</p>
              <p className="home-feature-subtitle">Verified by Islamic Scholars</p>
            </div>
          </div>
        </div>
      </section>

      {/* Product List */}
      <section className="home-catalog-section">
        <div className="home-catalog-header">
          <div>
            <h2 className="home-catalog-title">Our Publications</h2>
            <p className="home-catalog-subtitle">Our best-selling publications, translations, and guides.</p>
          </div>
        </div>

        {loading ? (
          <div className="home-grid">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="home-skeleton-wrapper">
                <Skeleton className="h-[300px] w-full rounded-xl" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="home-grid">
              {products
                .slice(0, 8)
                .map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onAddToCart={onAddToCart} 
                    onAddToWishlist={onAddToWishlist}
                    isWishlisted={wishlist.includes(product.id)}
                  />
                ))}
            </div>

            <div className="home-view-more">
              <Link to="/categories">
                <button className="home-view-more-btn">
                  View More Books <ArrowRight className="ml-2 w-5 h-5" />
                </button>
              </Link>
            </div>
          </>
        )}
      </section>

      <section className="home-about-section">
        <div className="home-about-container">
          <div className="home-about-img-col">
            <div className="home-about-img-frame">
              <img 
                src="/assets/3.png" 
                alt="Bookshelf" 
              />
            </div>
            <div className="home-about-badge">
              <p className="badge-title">SCHOLARLY WORK</p>
              <p className="badge-desc">Carefully researched publications for high spiritual values and character building.</p>
            </div>
          </div>
          <div className="home-about-content-col">
            <h2>AUTHENTIC ISLAMIC PUBLISHING.</h2>
            <p className="home-about-quote">
              "We do not just publish books; we nurture hearts. Every publication of Islamic Foundation Trust (IFT) Chennai undergoes rigorous review by scholars to ensure accuracy, authenticity, and clarity."
            </p>
            <div className="home-about-points">
              <div className="home-about-point">
                <div className="home-about-point-icon">
                  <ShieldCheck />
                </div>
                <div>
                  <p className="home-about-point-title">Scholarly Accuracy</p>
                  <p className="home-about-point-desc">Translations and commentaries cross-verified by panels of qualified theologians.</p>
                </div>
              </div>
              <div className="home-about-point">
                <div className="home-about-point-icon">
                  <Sparkles />
                </div>
                <div>
                  <p className="home-about-point-title">High Quality Prints</p>
                  <p className="home-about-point-desc">Premium paper, durable binding, and modern typography for a wonderful reading experience.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
export default Home;
