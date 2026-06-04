import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, ArrowRight } from 'lucide-react';
import { ALL_BOOKS } from '@/lib/bookCatalog.js';
import { apiFetch } from '@/services/api.js';
import './Authors.css';

// Base static authors provided by the user with their fallback catalog count
const staticAuthorsBase = [
  { name: "A. Hussaini", defaultBooksCount: 1 },
  { name: "Abdul Wahid Khan", defaultBooksCount: 1 },
  { name: "Abdullah Adiyar", defaultBooksCount: 2 },
  { name: "Abdun Nasar Abir", defaultBooksCount: 1 },
  { name: "Abdur Rahman Rafat Pasha", defaultBooksCount: 1 },
  { name: "Adirai Ahmed", defaultBooksCount: 3 },
  { name: "As-Shaikh Sayyid Sabiq", defaultBooksCount: 12 },
  { name: "Ashiekh Khalid Mohammed Minhaj Silahi", defaultBooksCount: 1 },
  { name: "Ashsheikh M.M.M. Asam", defaultBooksCount: 1 },
  { name: "Asim Nomani", defaultBooksCount: 1 },
  { name: "Athiya Siddiqua", defaultBooksCount: 1 },
  { name: "Binthul Islam", defaultBooksCount: 1 },
  { name: "Dr Ali Muhammad al-Salabi", defaultBooksCount: 9 },
  { name: "Dr. Aaiz bin Abdullah Alqarni", defaultBooksCount: 1 },
  { name: "Dr. Adil Salahi", defaultBooksCount: 2 },
  { name: "Dr. Fazlur Rahman Faridi", defaultBooksCount: 2 },
  { name: "Dr. Inayathullah Subhani", defaultBooksCount: 1 },
  { name: "Dr. J. Mohideen", defaultBooksCount: 6 },
  { name: "Dr. Jamal A. Badawi", defaultBooksCount: 2 },
  { name: "Dr. K.V.S. Habeeb Mohammed", defaultBooksCount: 53 },
  { name: "Dr. M. Umer Chapra", defaultBooksCount: 2 },
  { name: "Dr. M.I. Ahamed Maricar", defaultBooksCount: 1 },
  { name: "Dr. Qurshid Ahmed", defaultBooksCount: 5 },
  { name: "Dr. Raziul Islam Nadwi", defaultBooksCount: 1 },
  { name: "Dr. Sumaiya Ramalan", defaultBooksCount: 1 },
  { name: "Dr. V. Abdur Rahim", defaultBooksCount: 47 },
  { name: "Dr. Wakkar Anwar", defaultBooksCount: 1 },
  { name: "Dr. Yusuf Al Qaradhawi", defaultBooksCount: 6 },
  { name: "Dr. Zaki", defaultBooksCount: 1 },
  { name: "Elma Ruth Harder", defaultBooksCount: 1 },
  { name: "Fathimuthu Siddiq", defaultBooksCount: 1 },
  { name: "G. Abdur Rahim", defaultBooksCount: 3 },
  { name: "Ghulam Sarwar", defaultBooksCount: 2 },
  { name: "H. Abdur Raqeeb", defaultBooksCount: 5 },
  { name: "Hazrat Sheikh Sha Waliullah", defaultBooksCount: 1 },
  { name: "Humaira Moududi", defaultBooksCount: 1 },
  { name: "Ibrahim Sayeed", defaultBooksCount: 1 },
  { name: "Imam Torres - Al Haneef", defaultBooksCount: 1 },
  { name: "Jamaat-e-Islami Hind - Chennai Metro", defaultBooksCount: 1 },
  { name: "Jarina Jamal", defaultBooksCount: 1 }
];

export function Authors() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [liveBooks, setLiveBooks] = useState([]);
  const authorsPerPage = 12;

  // Load books from MongoDB database on mount (falls back to ALL_BOOKS)
  useEffect(() => {
    async function loadBooks() {
      try {
        const response = await apiFetch('/api/books');
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setLiveBooks(data.map((b) => ({
              ...b,
              id: b._id || b.id
            })));
            return;
          }
        }
        setLiveBooks(ALL_BOOKS);
      } catch (error) {
        console.error("Failed to load publications for Authors catalog:", error);
        setLiveBooks(ALL_BOOKS);
      }
    }
    loadBooks();
  }, []);

  const normalize = (val) => val.trim().toLowerCase().replace(/[^a-z0-9]+/g, '');

  // Group books dynamically by author, then merge with static authors
  const compiledAuthors = useMemo(() => {
    const liveCounts = {};
    liveBooks.forEach((book) => {
      if (book.author) {
        const key = normalize(book.author);
        liveCounts[key] = (liveCounts[key] || 0) + 1;
      }
    });

    const processedLiveAuthors = new Set();

    // 1. Map existing static authors, using live overrides if matching publications exist in MongoDB
    const authorsList = staticAuthorsBase.map((author, index) => {
      const key = normalize(author.name);
      processedLiveAuthors.add(key);
      const liveCount = liveCounts[key];

      return {
        id: `static-${index + 1}`,
        name: author.name,
        booksCount: liveCount !== undefined && liveCount > 0 ? liveCount : author.defaultBooksCount
      };
    });

    // 2. Scan and append dynamic authors newly added/edited in Admin panel
    let dynamicIndex = 1;
    liveBooks.forEach((book) => {
      if (book.author) {
        const key = normalize(book.author);
        if (!processedLiveAuthors.has(key)) {
          processedLiveAuthors.add(key);
          const displayAuthorName = book.author.trim().replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase());
          
          authorsList.push({
            id: `dynamic-${dynamicIndex++}`,
            name: displayAuthorName,
            booksCount: liveCounts[key] || 1
          });
        }
      }
    });

    return authorsList.sort((a, b) => a.name.localeCompare(b.name));
  }, [liveBooks]);

  // Filter authors by search bar query
  const filteredAuthors = useMemo(() => {
    if (!searchQuery.trim()) return compiledAuthors;
    const query = searchQuery.toLowerCase().trim();
    return compiledAuthors.filter((auth) => auth.name.toLowerCase().includes(query));
  }, [compiledAuthors, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Paginated authors list
  const indexOfLastAuthor = currentPage * authorsPerPage;
  const indexOfFirstAuthor = indexOfLastAuthor - authorsPerPage;
  const currentAuthors = filteredAuthors.slice(indexOfFirstAuthor, indexOfLastAuthor);
  const totalPages = Math.ceil(filteredAuthors.length / authorsPerPage);

  const handleViewAuthorBooks = (authorName) => {
    navigate(`/categories?search=${encodeURIComponent(authorName)}`);
  };

  const getInitials = (name) => {
    const cleanName = name.replace(/Dr\.|Aaiz|Sheikh|As-Shaikh|Ashsheikh|Hazrat/gi, '').trim();
    const parts = cleanName.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    if (parts.length === 1 && parts[0].length >= 2) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="authors-page text-left">
      <div className="authors-header">
        <h1>Islamic Scholars & Authors</h1>
        <p>Explore scholarly works, tafseer exegesis, and cultural publications by renowned contemporary writers.</p>
        <div className="authors-count">
          Total {compiledAuthors.length} Active Authors
        </div>
      </div>

      <div className="authors-search-container">
        <input 
          type="text" 
          placeholder="Search scholars, writers, and authors..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="authors-search-input"
        />
        <Search className="authors-search-icon" size={18} />
      </div>

      {filteredAuthors.length > 0 ? (
        <div className="authors-grid">
          {currentAuthors.map((author) => (
            <div key={author.id} className="author-card animate-fade-in">
              <div className="author-avatar-initials">
                {getInitials(author.name)}
              </div>

              <div className="author-info">
                <h3>{author.name}</h3>
                <div className="author-books-count">
                  {author.booksCount} {author.booksCount === 1 ? 'publication' : 'publications'}
                </div>
                
                <button 
                  className="view-books-btn"
                  onClick={() => handleViewAuthorBooks(author.name)}
                >
                  View Books <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="authors-empty animate-fade-in text-center">
          <BookOpen size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3>No Authors Found</h3>
          <p>We couldn't find any scholars matching "{searchQuery}". Try adjusting your keywords.</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="page-btn"
          >
            Previous
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
            >
              {i + 1}
            </button>
          ))}
          
          <button 
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="page-btn"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
export default Authors;
