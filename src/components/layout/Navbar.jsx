import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Heart, User, Search, Menu, LayoutDashboard, Phone, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthProvider.jsx';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ALL_BOOKS } from '@/lib/bookCatalog.js';
import { apiFetch } from '@/services/api.js';
import './Navbar.css';

export function Navbar({ cartCount }) {
  const { user, isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showBooksDropdown, setShowBooksDropdown] = useState(false);
  const [showEBooksDropdown, setShowEBooksDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // State to store live database books
  const [booksList, setBooksList] = useState([]);

  // Load books from MongoDB on mount (or fallback to ALL_BOOKS catalog)
  useEffect(() => {
    async function loadBooks() {
      try {
        const response = await apiFetch('/api/books');
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setBooksList(data.map((b) => ({
              ...b,
              id: b._id || b.id
            })));
            return;
          }
        }
        setBooksList(ALL_BOOKS);
      } catch (error) {
        console.error("Error fetching books in Navbar suggestions:", error);
        setBooksList(ALL_BOOKS);
      }
    }
    loadBooks();
  }, []);

  // Compute unique authors dynamically based on database contents
  const authorsList = useMemo(() => {
    const authorsMap = {};
    booksList.forEach((book) => {
      if (book.author) {
        const authorName = book.author.trim();
        const displayAuthor = authorName.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase());
        authorsMap[displayAuthor] = (authorsMap[displayAuthor] || 0) + 1;
      }
    });
    return Object.keys(authorsMap).map((name) => ({
      name,
      category: 'author',
      booksCount: authorsMap[name]
    }));
  }, [booksList]);

  // Compute search suggestions
  const suggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().trim();

    // Find books matching the query
    const matchedBooks = booksList
      .filter((book) => book.name.toLowerCase().includes(query) || (book.author && book.author.toLowerCase().includes(query)))
      .map((book) => ({
        id: book.id,
        name: book.name,
        category: 'book',
        type: book.category ? book.category.split(' ')[0].toLowerCase() : 'english',
        price: book.price
      }));

    // Find authors matching the query
    const matchedAuthors = authorsList
      .filter((auth) => auth.name.toLowerCase().includes(query))
      .map((auth, index) => ({
        id: `author-${index}`,
        name: auth.name,
        category: 'author',
        booksCount: auth.booksCount
      }));

    return [...matchedBooks, ...matchedAuthors].slice(0, 10);
  }, [searchQuery, booksList, authorsList]);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle suggestion click
  const handleSuggestionClick = (item) => {
    setSearchQuery(item.name);
    setShowSuggestions(false);

    if (item.category === 'book') {
      navigate(`/product/${item.id}`);
    } else if (item.category === 'author') {
      navigate(`/categories?search=${encodeURIComponent(item.name)}`);
    }
  };

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setShowSuggestions(false);
    navigate(`/categories?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  // Highlight matches in suggestions
  const highlightMatch = (text, query) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === query.toLowerCase() ? 
        <mark key={index} className="highlight">{part}</mark> : part
    );
  };

  return (
    <header className="navbar-wrapper">
      <div className="nav-container">
        
        {/* Top Row */}
        <div className="nav-top">
          <Link to="/" className="logo-section">
            <img src="/assets/logo.png" alt="Islamic Foundation Trust" className="logo-image" />
            <div className="logo-text-group">
              <span className="logo-title">Islamic Foundation Trust</span>
              <span className="logo-tagline">Publications & Translations since 1973</span>
            </div>
          </Link>
          
          <div className="contact-info">
            <a href="tel:+914426624401" className="contact-widget">
              <span className="phone-icon"><Phone size={14} /></span>
              <div>
                <span className="widget-label">Call Support</span>
                <span className="widget-value">+91-44-26624401</span>
              </div>
            </a>
            
            <a href="https://wa.me/918668057596" target="_blank" rel="noreferrer" className="contact-widget whatsapp">
              <span className="whatsapp-icon">💬</span>
              <div>
                <span className="widget-label">WhatsApp Contact</span>
                <span className="widget-value">+91 8668057596</span>
              </div>
            </a>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="nav-bottom">
          <ul className="nav-links">
            <li>
              <Link to="/" className={`nav-link-item ${location.pathname === '/' ? 'active' : ''}`}>
                Home
              </Link>
            </li>
            
            {/* Books Dropdown */}
            <li 
              className="dropdown"
              onMouseEnter={() => setShowBooksDropdown(true)}
              onMouseLeave={() => setShowBooksDropdown(false)}
            >
              <Link to="/categories" className={`nav-link-item ${location.pathname.startsWith('/categories') && !['/categories/ebook', '/categories/epub'].includes(location.pathname) ? 'active' : ''}`}>
                Books <ChevronDown size={12} className="arrow-icon" />
              </Link>
              <ul className="dropdown-menu">
                <li><Link to="/categories/tamil">Tamil Books</Link></li>
                <li><Link to="/categories/arabic">Arabic Books</Link></li>
                <li><Link to="/categories/english">English Books</Link></li>
                <li><Link to="/categories/urdu">Urdu Books</Link></li>
              </ul>
            </li>
            
            <li>
              <Link to="/categories" className="nav-link-item">
                Audio Books
              </Link>
            </li>
            
            {/* E-Books Dropdown */}
            <li 
              className="dropdown"
              onMouseEnter={() => setShowEBooksDropdown(true)}
              onMouseLeave={() => setShowEBooksDropdown(false)}
            >
              <Link to="/categories/ebook" className={`nav-link-item ${['/categories/ebook', '/categories/epub'].includes(location.pathname) ? 'active' : ''}`}>
                E-Books <ChevronDown size={12} className="arrow-icon" />
              </Link>
              <ul className="dropdown-menu">
                <li><Link to="/categories/ebook">E-Books (PDF)</Link></li>
                <li><Link to="/categories/epub">E-Pub (EPUB)</Link></li>
              </ul>
            </li>
            
            <li>
              <Link to="/authors" className={`nav-link-item ${location.pathname === '/authors' ? 'active' : ''}`}>
                Authors
              </Link>
            </li>
            
            <li>
              <Link to="/about" className={`nav-link-item ${location.pathname === '/about' ? 'active' : ''}`}>
                News
              </Link>
            </li>
            
            <li>
              <Link to="/equran" className="nav-link-item">
                E-Qurán
              </Link>
            </li>
          </ul>
          
          <div className="nav-right">
            
            {/* Search Bar */}
            <div className="search-container" ref={searchRef}>
              <form onSubmit={handleSearchSubmit} className="search-bar">
                <input 
                  type="text" 
                  placeholder="Search books, authors..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.trim() !== '' && setShowSuggestions(true)}
                  autoComplete="off"
                  className="search-input"
                />
                <button type="submit" className="search-btn-icon">
                  <Search size={16} />
                </button>
              </form>
              
              {/* Auto-suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="search-suggestions">
                  {suggestions.map((item) => (
                    <div 
                      key={item.id} 
                      className="suggestion-item"
                      onClick={() => handleSuggestionClick(item)}
                    >
                      <div className="suggestion-content">
                        <div className="suggestion-name">
                          {highlightMatch(item.name, searchQuery)}
                        </div>
                        <div className="suggestion-category">
                          {item.category === 'book' ? (
                            <span>Book • {item.type?.toUpperCase()} {item.price ? `• ₹${item.price}` : ''}</span>
                          ) : (
                            <span>Author • {item.booksCount} publications</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* User Quick Actions */}
            <div className="user-actions">
              <Link to="/profile" className="action-link track-order">
                Track Order
              </Link>
              <Link to="/profile" className="action-link">
                My Account
              </Link>
              <Link to="/categories" className="action-link">
                E Library
              </Link>
              <Link to="/admin" className="action-link text-[#388e3c] font-bold flex items-center gap-1.5" title="Admin Dashboard">
                <LayoutDashboard size={15} /> <span>Admin Portal</span>
              </Link>
              <Link to="/wishlist" className="action-link" title="Wishlist">
                <Heart size={18} />
              </Link>
            </div>
            
            {/* Shopping Cart Trigger */}
            <Link to="/cart" className="cart-trigger" title="Shopping Cart">
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="cart-badge">{cartCount}</span>
              )}
            </Link>
            
          </div>
        </div>

        {/* Mobile Responsive Header */}
        <div className="mobile-header">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
            <img src="/assets/logo.png" alt="Logo" className="h-10 w-auto" />
            <span className="text-sm font-extrabold text-primary">Islamic Foundation Trust</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <Link to="/cart" className="cart-trigger" style={{ width: '36px', height: '36px' }}>
              <ShoppingCart size={16} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
            
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger render={<button type="button" className="hamburger-btn" />}>
                <Menu size={22} />
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px] p-6 overflow-y-auto">
                <div className="flex flex-col gap-6 mt-6">
                  
                  <div className="text-center pb-4 border-b">
                    <img src="/assets/logo.png" alt="Logo" className="h-14 mx-auto mb-2" />
                    <h3 className="font-extrabold text-green-800 text-sm">Islamic Foundation Trust</h3>
                    <p className="text-[10px] text-muted-foreground">Chennai</p>
                  </div>

                  <form onSubmit={handleSearchSubmit} className="relative mt-2">
                    <input 
                      type="text" 
                      placeholder="Search books..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-700"
                    />
                    <button type="submit" className="absolute right-2.5 top-2.5 text-muted-foreground">
                      <Search size={14} />
                    </button>
                  </form>
                  
                  <div className="flex flex-col gap-3 font-semibold text-sm">
                    <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="py-1.5 border-b hover:text-green-700">Home</Link>
                    
                    <div className="flex flex-col gap-1.5 pl-2 border-l-2 border-green-700">
                      <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Books Category</span>
                      <Link to="/categories/tamil" onClick={() => setIsMobileMenuOpen(false)} className="py-1 hover:text-green-700">Tamil Books</Link>
                      <Link to="/categories/arabic" onClick={() => setIsMobileMenuOpen(false)} className="py-1 hover:text-green-700">Arabic Books</Link>
                      <Link to="/categories/english" onClick={() => setIsMobileMenuOpen(false)} className="py-1 hover:text-green-700">English Books</Link>
                      <Link to="/categories/urdu" onClick={() => setIsMobileMenuOpen(false)} className="py-1 hover:text-green-700">Urdu Books</Link>
                    </div>

                    <Link to="/categories" onClick={() => setIsMobileMenuOpen(false)} className="py-1.5 border-b hover:text-green-700">Audio Books</Link>
                    
                    <div className="flex flex-col gap-1.5 pl-2 border-l-2 border-amber-500">
                      <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Digital Features</span>
                      <Link to="/equran" onClick={() => setIsMobileMenuOpen(false)} className="py-1 hover:text-amber-600 font-extrabold text-emerald-800 dark:text-emerald-400">E-Qurán</Link>
                      <Link to="/categories/ebook" onClick={() => setIsMobileMenuOpen(false)} className="py-1 hover:text-amber-600">E-Books (PDF)</Link>
                      <Link to="/categories/epub" onClick={() => setIsMobileMenuOpen(false)} className="py-1 hover:text-amber-600">E-Pub (EPUB)</Link>
                    </div>

                    <Link to="/authors" onClick={() => setIsMobileMenuOpen(false)} className="py-1.5 border-b hover:text-green-700">Authors</Link>
                    <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="py-1.5 border-b hover:text-green-700">News</Link>
                  </div>

                  <div className="flex flex-col gap-2 pt-2 border-t">
                    <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 text-xs py-1.5 hover:text-green-700">
                      <User size={14} /> My Profile / Track Order
                    </Link>
                    <Link to="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 text-xs py-1.5 hover:text-green-700">
                      <Heart size={14} /> My Wishlist
                    </Link>
                    <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2.5 text-xs py-3 px-4 bg-emerald-50 dark:bg-emerald-950/20 text-[#388e3c] font-extrabold rounded-xl border border-emerald-500/20 border-dashed justify-center shadow-sm hover:scale-[1.02] active:scale-95 transition-all mt-2.5">
                      <LayoutDashboard size={15} /> <span>Admin Portal Login</span>
                    </Link>
                  </div>

                  <div className="flex flex-col gap-2 pt-4 border-t text-[11px]">
                    <a href="tel:+914426624401" className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-900 rounded-lg text-slate-700 dark:text-slate-200">
                      <Phone size={12} /> Call Support: +91-44-26624401
                    </a>
                    <a href="https://wa.me/918668057596" target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950/20 rounded-lg text-green-700 dark:text-green-400 font-semibold">
                      💬 WhatsApp: +91 8668057596
                    </a>
                  </div>

                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

      </div>
    </header>
  );
}
