import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { Search, BookOpen, ChevronRight, RefreshCw, SlidersHorizontal, ArrowLeft, Star, ShoppingCart, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductCard } from '@/components/shared/ProductCard.jsx';
import { motion, AnimatePresence } from 'motion/react';
import { ALL_BOOKS } from '@/lib/bookCatalog.js';
import { apiFetch } from '@/services/api.js';
import './Categories.css';


export function Categories({ onAddToCart = () => {}, onAddToWishlist = () => {}, wishlist = [] }) {
  const { lang } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [books, setBooks] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [priceRange, setPriceRange] = useState({ min: 50, max: 5000 });
  const [showFilters, setShowFilters] = useState(false);
  const [visibleCount, setVisibleCount] = useState(24);
  const [isLoading, setIsLoading] = useState(false);

  // Helper to generate E-Books with custom images looped repeatedly
  const generateEBooks = () => {
    const authorsList = [
      "A. Hussaini", "Abdul Wahid Khan", "Abdullah Adiyar", 
      "Dr Ali Muhammad al-Salabi", "Dr. Aaiz bin Abdullah Alqarni", "Dr. Adil Salahi"
    ];
    const bookTitles = [
      "Al-Qur'an Translation & Commentary", "Arabic Grammar Simplified", "Key to Al-Fiqh",
      "Scholarly Reflections", "Essentials of Daily Dua", "Biographical Accounts",
      "Pillars of Faith", "Guide to Islamic Character", "Wisdom of the Companions"
    ];
    return Array.from({ length: 68 }, (_, index) => {
      const i = index + 1;
      const title = `E-Book: ${bookTitles[(i - 1) % bookTitles.length]} (PDF Vol. ${Math.ceil(i / bookTitles.length)})`;
      const author = authorsList[(i - 1) % authorsList.length];
      const price = 60 + (i * 7) % 200;
      return {
        id: `ebook-${i}`,
        name: title,
        author,
        price,
        originalPrice: Math.round(price * 1.25),
        category: 'E-Books',
        imageUrl: `/assets/E-book/book${((i - 1) % 5) + 1}.png`,
        description: "High-quality electronic edition of our Islamic publication for digital reading.",
        stock: 100,
        tags: ['digital', 'ebook', 'scholarly']
      };
    });
  };

  // Helper to generate E-Pubs with custom images looped repeatedly
  const generateEPubs = () => {
    const authorsList = [
      "As-Shaikh Sayyid Sabiq", "Asim Nomani", "Athiya Siddiqua",
      "Dr. Aaiz bin Abdullah Alqarni", "Dr Ali Muhammad al-Salabi", "A. Hussaini"
    ];
    const pubTitles = [
      "Principles of Islamic Ethics", "History of Islamic Civilization", "Introduction to Sunnah",
      "The Virtuous Family", "Sermons of the Scholars", "Hadith Terminology Guide",
      "Islamic Civilization Review", "Spiritual Foundations", "Daily Remembrances"
    ];
    return Array.from({ length: 105 }, (_, index) => {
      const i = index + 1;
      const title = `E-Pub: ${pubTitles[(i - 1) % pubTitles.length]} (EPUB Vol. ${Math.ceil(i / pubTitles.length)})`;
      const author = authorsList[(i - 1) % authorsList.length];
      const price = 45 + (i * 9) % 180;
      return {
        id: `epub-${i}`,
        name: title,
        author,
        price,
        originalPrice: Math.round(price * 1.3),
        category: 'E-Pub',
        imageUrl: `/assets/E-pub/pub${((i - 1) % 5) + 1}.png`,
        description: "Premium EPUB format publication designed for seamless e-reader rendering and adjustable fonts.",
        stock: 100,
        tags: ['epub', 'digital', 'scholarly']
      };
    });
  };

  // Fetch live books list from backend API
  useEffect(() => {
    async function fetchAllBooks() {
      try {
        const response = await apiFetch('/api/books');
        let liveBooks = [];
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            liveBooks = data.map((b) => ({
              ...b,
              id: b._id || b.id
            }));
          }
        }
        
        if (liveBooks.length === 0) {
          liveBooks = [...ALL_BOOKS];
        }

        setBooks(liveBooks);
      } catch (error) {
        console.error("Failed to fetch books from MongoDB:", error);
        setBooks([...ALL_BOOKS]);
      }
    }
    fetchAllBooks();
  }, []);

  const ebooksList = useMemo(() => generateEBooks(), []);
  const epubsList = useMemo(() => generateEPubs(), []);

  // Sync search query from URL parameter (?search=...)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get('search');
    if (search) {
      setSearchQuery(search);
    } else {
      setSearchQuery('');
    }
  }, [location.search]);

  // Synchronize URL route parameter with language tab state
  useEffect(() => {
    if (lang) {
      const formatted = lang.toLowerCase();
      if (formatted === 'tamil') {
        setSelectedLanguage('Tamil Books');
      } else if (formatted === 'english') {
        setSelectedLanguage('English Books');
      } else if (formatted === 'arabic') {
        setSelectedLanguage('Arabic Books');
      } else if (formatted === 'urdu') {
        setSelectedLanguage('Urdu Books');
      } else if (formatted === 'ebook') {
        setSelectedLanguage('E-Books');
      } else if (formatted === 'epub') {
        setSelectedLanguage('E-Pub');
      } else {
        setSelectedLanguage('All');
      }
    } else {
      setSelectedLanguage('All');
    }
  }, [lang]);

  // Synchronize language tab clicks with URL routing while preserving search query
  const handleLanguageChange = (langVal) => {
    setSelectedLanguage(langVal);
    const searchParams = new URLSearchParams(location.search).toString();
    const queryStr = searchParams ? `?${searchParams}` : '';
    
    if (langVal === 'All') {
      navigate(`/categories${queryStr}`);
    } else {
      let slug = langVal.split(' ')[0].toLowerCase();
      if (langVal === 'E-Books') slug = 'ebook';
      if (langVal === 'E-Pub') slug = 'epub';
      navigate(`/categories/${slug}${queryStr}`);
    }
  };

  // Get dynamic item counts for each language tab
  const langCounts = useMemo(() => {
    return {
      All: books.length, 
      'Tamil Books': books.filter(b => b.category === 'Tamil Books').length,
      'English Books': books.filter(b => b.category === 'English Books').length,
      'Arabic Books': books.filter(b => b.category === 'Arabic Books').length,
      'Urdu Books': books.filter(b => b.category === 'Urdu Books').length,
      'E-Books': ebooksList.length, 
      'E-Pub': epubsList.length, 
    };
  }, [books, ebooksList, epubsList]);

  // Filter and sort the books dynamically based on inputs
  const filteredBooks = useMemo(() => {
    let list = [];

    if (selectedLanguage === 'E-Books') {
      list = [...ebooksList];
    } else if (selectedLanguage === 'E-Pub') {
      list = [...epubsList];
    } else {
      list = [...books];
      if (selectedLanguage !== 'All') {
        list = list.filter(b => b.category === selectedLanguage);
      }
    }

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      list = list.filter(b => 
        b.name.toLowerCase().includes(query) ||
        (b.author && b.author.toLowerCase().includes(query))
      );
    }

    list = list.filter(b => b.price >= priceRange.min && b.price <= priceRange.max);

    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name-asc') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'name-desc') {
      list.sort((a, b) => b.name.localeCompare(a.name));
    }

    return list;
  }, [books, ebooksList, epubsList, selectedLanguage, searchQuery, priceRange, sortBy]);

  useEffect(() => {
    setVisibleCount(24);
  }, [selectedLanguage, searchQuery, priceRange, sortBy]);

  const handleLoadMore = () => {
    setIsLoading(true);
    setTimeout(() => {
      setVisibleCount(prev => prev + 24);
      setIsLoading(false);
    }, 400);
  };

  const activeBooks = filteredBooks.slice(0, visibleCount);

  const heroContent = useMemo(() => {
    if (selectedLanguage === 'E-Books') {
      return {
        badge: "Digital PDF Catalog",
        title: <>Explore E-Books <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">(PDF)</span></>,
        description: "Browse through our premium digital collection of exactly 68 PDF E-Books. High-quality reading optimized for tablets, laptops, and mobile screens."
      };
    } else if (selectedLanguage === 'E-Pub') {
      return {
        badge: "Digital EPUB Catalog",
        title: <>Explore E-Pubs <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">(EPUB)</span></>,
        description: "Browse through our professional collection of exactly 105 EPUB publications. Refined layouts designed for e-readers, Kindle, and adjustable typography."
      };
    } else {
      return {
        badge: "Direct Publications Catalog",
        title: <>Explore All <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">Books</span></>,
        description: `Browse through our collection of exactly ${ALL_BOOKS.length} books published by Islamic Foundation Trust (IFT) Chennai. Instant filters enable direct access to books in Tamil, English, Arabic, and Urdu.`
      };
    }
  }, [selectedLanguage]);

  return (
    <div className="categories-page">
      <div className="categories-hero-bg" />
      <div className="categories-radial-bg" />

      {/* Hero Header */}
      <section className="categories-hero">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="categories-hero-content"
        >
          <Badge className="categories-badge">
            <BookOpen className="w-4 h-4 mr-2 inline" />
            {heroContent.badge}
          </Badge>
          <h1 className="categories-title">
            {heroContent.title}
          </h1>
          <p className="categories-subtitle">
            {heroContent.description}
          </p>
        </motion.div>
      </section>

      {/* Control Panel */}
      <section className="categories-controls">
        <div className="categories-controls-card">
          <div className="categories-search-row">
            <div className="categories-search-wrapper">
              <Search className="categories-search-icon" />
              <input
                type="search"
                placeholder="Search by title or author..."
                value={searchQuery}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchQuery(val);
                  const params = new URLSearchParams(location.search);
                  if (val.trim()) {
                    params.set('search', val);
                  } else {
                    params.delete('search');
                  }
                  navigate({ search: params.toString() }, { replace: true });
                }}
                className="categories-search-input"
              />
            </div>

            <div className="categories-action-row">
              <Button
                variant={showFilters ? 'default' : 'outline'}
                onClick={() => setShowFilters(!showFilters)}
                className="categories-filter-btn"
              >
                <SlidersHorizontal className="w-4 h-4" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>

              <div className="categories-sort-wrapper">
                <span>Sort By</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="categories-sort-select"
                >
                  <option value="default">Default</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                  <option value="name-desc">Name: Z to A</option>
                </select>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="categories-filter-panel"
              >
                <h3>Filter by Price Range</h3>
                <div className="categories-price-form">
                  <div className="categories-price-input-group">
                    <label>Min (₹)</label>
                    <input
                      type="number"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({ ...priceRange, min: Math.max(0, parseInt(e.target.value) || 0) })}
                    />
                  </div>
                  <div className="categories-price-input-group">
                    <label>Max (₹)</label>
                    <input
                      type="number"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: Math.max(0, parseInt(e.target.value) || 5000) })}
                    />
                  </div>
                  <div className="categories-price-slider-group">
                    <input
                      type="range"
                      min="50"
                      max="5000"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) || 5000 })}
                    />
                    <span className="categories-price-range-label">Range: ₹{priceRange.min} - ₹{priceRange.max}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="categories-tabs-row">
            {['E-Books', 'E-Pub'].includes(selectedLanguage) ? (
              <div className="categories-digital-banner">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleLanguageChange('All')}
                  className="rounded-full px-5 h-10 text-xs font-bold transition-all hover:bg-primary hover:text-primary-foreground flex items-center gap-2 border-primary/30"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Main Books Catalog ({langCounts['All']})
                </Button>
                <div className="categories-digital-text">
                  Currently viewing isolated digital catalog: {selectedLanguage === 'E-Books' ? 'E-Books (PDF)' : 'E-Pub (EPUB)'}
                </div>
              </div>
            ) : (
              ['All', 'Tamil Books', 'English Books', 'Arabic Books', 'Urdu Books'].map((langVal) => (
                <button
                  key={langVal}
                  onClick={() => handleLanguageChange(langVal)}
                  className={`categories-tab-btn ${selectedLanguage === langVal ? 'active' : 'inactive'}`}
                >
                  {langVal === 'All' ? 'All Books' : langVal} ({langCounts[langVal]})
                </button>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Books Display Count */}
      <section className="categories-count-section">
        <div className="categories-count-text">
          <Layers className="w-4 h-4 text-primary" />
          <span>Showing {filteredBooks.length} of {langCounts[selectedLanguage]} Publications</span>
        </div>
      </section>

      {/* Publications Grid */}
      <section className="categories-grid-section">
        {filteredBooks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="categories-empty"
          >
            <BookOpen className="categories-empty-icon" />
            <h3>No Publications Found</h3>
            <p>
              We couldn't find any book matching "{searchQuery}" under the current filters. Try relaxing your filters or typing another search term.
            </p>
            <Button
              onClick={() => {
                setSearchQuery('');
                setPriceRange({ min: 50, max: 5000 });
                setSelectedLanguage('All');
                navigate('/categories');
              }}
              className="categories-empty-btn"
            >
              Reset Search & Filters
            </Button>
          </motion.div>
        ) : (
          <>
            <motion.div
              layout
              className="categories-grid"
            >
              <AnimatePresence mode="popLayout">
                {activeBooks.map((book, idx) => (
                  <motion.div
                    key={book.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: Math.min(idx * 0.015, 0.15) }}
                  >
                    <ProductCard
                      product={book}
                      onAddToCart={onAddToCart}
                      onAddToWishlist={onAddToWishlist}
                      isWishlisted={wishlist.includes(book.id)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Load More */}
            {filteredBooks.length > visibleCount && (
              <div className="categories-load-more">
                <Button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  size="lg"
                  className="categories-load-more-btn"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    `Load More Publications (${filteredBooks.length - visibleCount} remaining)`
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
export default Categories;
