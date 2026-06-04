import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthProvider.jsx';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ShoppingBag, Eye, RefreshCw, ChevronLeft, MapPin, 
  Mail, Phone, FileText, Plus, Trash2, LayoutDashboard,
  CheckCircle, Clock, Truck, XCircle, AlertTriangle, Key, ShieldCheck, Edit3,
  Upload, BookOpen, Search
} from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '@/services/api.js';
import './AdminDashboard.css';


// Exact High-Fidelity Demo Orders from the WooCommerce Screenshots
const DEMO_ORDERS = [
  {
    id: "8726",
    _id: "demo-8726",
    createdAt: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
    status: 'completed',
    total: 310,
    origin: 'Organic: Google',
    customerIp: '2401:4900:4dd6:1e2e:bab6:cdda:ee9b:b29d',
    razorpayPaymentId: 'pay_StelwdIWIZatmQ',
    razorpayOrderId: 'order_StelmdF4isEE0M',
    razorpaySignature: 'sig_mock_sulaiman',
    items: [
      {
        quantity: 1,
        product: {
          name: 'Islam Belief & Teachings (Paper Back)',
          category: 'Islamic Education',
          price: 280,
          imageUrl: '/assets/1.png'
        }
      }
    ],
    billingDetails: {
      firstName: 'MOHAMMED SULAIMAN',
      lastName: 'M S',
      email: 'mdsulai76@gmail.com',
      phone: '9944360360',
      streetAddress1: '367/2E ISTHIMA NAGAR',
      streetAddress2: 'VEPPOOR VILLAGE',
      city: 'MELVISHARAM P O 632509',
      state: 'Tamil Nadu',
      pinCode: '632509',
      country: 'India'
    },
    shippingDetails: {
      firstName: 'MOHAMMED SULAIMAN',
      lastName: 'M S',
      streetAddress1: '367/2E ISTHIMA NAGAR',
      streetAddress2: 'VEPPOOR VILLAGE',
      city: 'MELVISHARAM P O 632509',
      state: 'Tamil Nadu',
      pinCode: '632509',
      country: 'India',
      orderNotes: 'Please send it immediately.'
    },
    statusHistory: [
      { id: "h1", note: 'Order status changed from Processing to Completed.', updatedAt: new Date(Date.now() - 13.5 * 60 * 60 * 1000).toISOString() },
      { id: "h2", note: 'Razorpay payment successful Razorpay Id: pay_StelwdIWIZatmQ', updatedAt: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString() },
      { id: "h3", note: 'Stock levels reduced: Islam Belief & Teachings (Paper Back) (84-83)', updatedAt: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString() },
      { id: "h4", note: 'Payment via Online (pay_StelwdIWIZatmQ).', updatedAt: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString() }
    ]
  },
  {
    id: "8711",
    _id: "demo-8711",
    createdAt: new Date(Date.now() - 19 * 60 * 60 * 1000).toISOString(),
    status: 'failed',
    total: 200,
    origin: 'Organic: Google',
    customerIp: '182.72.112.30',
    billingDetails: { firstName: 'Mohammed', lastName: 'Jashem', email: 'jashem@gmail.com', phone: '9845123650', streetAddress1: '12 North Beach Road', city: 'Chennai', state: 'Tamil Nadu', pinCode: '600001', country: 'India' },
    shippingDetails: { firstName: 'Mohammed', lastName: 'Jashem', streetAddress1: '12 North Beach Road', city: 'Chennai', state: 'Tamil Nadu', pinCode: '600001', country: 'India' },
    items: [
      { quantity: 1, product: { name: 'Principles of Islam', category: 'Islamic Literature', price: 200, imageUrl: '/assets/2.png' } }
    ],
    statusHistory: [
      { id: "h5", note: 'Razorpay payment gateway reported transaction failure.', updatedAt: new Date(Date.now() - 19 * 60 * 60 * 1000).toISOString() }
    ]
  },
  {
    id: "8710",
    _id: "demo-8710",
    createdAt: new Date("2026-05-23T11:42:00Z").toISOString(),
    status: 'completed',
    total: 350,
    origin: 'Unknown',
    customerIp: '45.115.110.12',
    billingDetails: { firstName: 'Jahangir', lastName: 'Syed Mohamed', email: 'jahangir@gmail.com', phone: '9003512345', streetAddress1: '25 Peters Road', city: 'Royapettah', state: 'Tamil Nadu', pinCode: '600014', country: 'India' },
    shippingDetails: { firstName: 'Jahangir', lastName: 'Syed Mohamed', streetAddress1: '25 Peters Road', city: 'Royapettah', state: 'Tamil Nadu', pinCode: '600014', country: 'India' },
    items: [
      { quantity: 1, product: { name: 'Noble Quran Tamil Translation', category: 'Translations', price: 350, imageUrl: '/assets/3.png' } }
    ],
    statusHistory: [
      { id: "h6", note: 'Order completed.', updatedAt: new Date("2026-05-23T12:00:00Z").toISOString() }
    ]
  },
  {
    id: "8709",
    _id: "demo-8709",
    createdAt: new Date("2026-05-23T09:15:00Z").toISOString(),
    status: 'completed',
    total: 330,
    origin: 'Unknown',
    customerIp: '103.88.220.15',
    billingDetails: { firstName: 'Mohammed', lastName: 'Mutahir', email: 'mutahir@gmail.com', phone: '9444123456', streetAddress1: '78 Mosque Street', city: 'Vaniyambadi', state: 'Tamil Nadu', pinCode: '635751', country: 'India' },
    shippingDetails: { firstName: 'Mohammed', lastName: 'Mutahir', streetAddress1: '78 Mosque Street', city: 'Vaniyambadi', state: 'Tamil Nadu', pinCode: '635751', country: 'India' },
    items: [
      { quantity: 1, product: { name: 'Islamic History & Culture', category: 'History', price: 300, imageUrl: '/assets/4.png' } }
    ],
    statusHistory: [
      { id: "h7", note: 'Order completed.', updatedAt: new Date("2026-05-23T10:00:00Z").toISOString() }
    ]
  },
  {
    id: "8708",
    _id: "demo-8708",
    createdAt: new Date("2026-05-23T08:30:00Z").toISOString(),
    status: 'completed',
    total: 320,
    origin: 'Unknown',
    billingDetails: { firstName: 'Abdul', lastName: 'Aleem', email: 'aleem@gmail.com', phone: '9840123789', streetAddress1: '54 Bazar Road', city: 'Ambur', state: 'Tamil Nadu', pinCode: '635802', country: 'India' },
    shippingDetails: { firstName: 'Abdul', lastName: 'Aleem', streetAddress1: '54 Bazar Road', city: 'Ambur', state: 'Tamil Nadu', pinCode: '635802', country: 'India' },
    items: [{ quantity: 1, product: { name: 'Dua Guide Book', price: 320, category: 'Dua Book', imageUrl: '/assets/1.png' } }]
  },
  {
    id: "8707",
    _id: "demo-8707",
    createdAt: new Date("2026-05-22T15:20:00Z").toISOString(),
    status: 'completed',
    total: 170,
    origin: 'Organic: Google',
    billingDetails: { firstName: 'Abdulla', lastName: 'Mahin', email: 'mahin@gmail.com', phone: '9442654321', streetAddress1: '89 Main Street', city: 'Trichy', state: 'Tamil Nadu', pinCode: '620001', country: 'India' },
    shippingDetails: { firstName: 'Abdulla', lastName: 'Mahin', streetAddress1: '89 Main Street', city: 'Trichy', state: 'Tamil Nadu', pinCode: '620001', country: 'India' },
    items: [{ quantity: 1, product: { name: 'Basic Arabic Grammar', price: 170, category: 'Arabic Grammar', imageUrl: '/assets/2.png' } }]
  },
  {
    id: "8706",
    _id: "demo-8706",
    createdAt: new Date("2026-05-22T10:10:00Z").toISOString(),
    status: 'completed',
    total: 0,
    origin: 'Organic: Google',
    billingDetails: { firstName: 'Mohammed', lastName: 'Siddiq M', email: 'siddiq@gmail.com', phone: '9944658974', streetAddress1: '12 Masjid street', city: 'Melvisharam', state: 'Tamil Nadu', pinCode: '632509', country: 'India' },
    shippingDetails: { firstName: 'Mohammed', lastName: 'Siddiq M', streetAddress1: '12 Masjid street', city: 'Melvisharam', state: 'Tamil Nadu', pinCode: '632509', country: 'India' },
    items: [{ quantity: 1, product: { name: 'Free Pamphlet on Peace', price: 0, category: 'Free Pamphlets', imageUrl: '/assets/3.png' } }]
  },
  {
    id: "8702",
    _id: "demo-8702",
    createdAt: new Date("2026-05-21T18:05:00Z").toISOString(),
    status: 'completed',
    total: 75,
    origin: 'Direct',
    billingDetails: { firstName: 'Riffayu', lastName: 'Kithabuteen', email: 'riffayu@gmail.com', phone: '9840123587', streetAddress1: '45 Lake view street', city: 'Madurai', state: 'Tamil Nadu', pinCode: '625001', country: 'India' },
    shippingDetails: { firstName: 'Riffayu', lastName: 'Kithabuteen', streetAddress1: '45 Lake view street', city: 'Madurai', state: 'Tamil Nadu', pinCode: '625001', country: 'India' },
    items: [{ quantity: 1, product: { name: 'Prophet Stories for Kids', price: 75, category: 'Kids books', imageUrl: '/assets/4.png' } }]
  },
  {
    id: "8692",
    _id: "demo-8692",
    createdAt: new Date("2026-05-19T14:02:00Z").toISOString(),
    status: 'cancelled',
    total: 170,
    origin: 'Unknown',
    billingDetails: { firstName: 'Abdulla', lastName: 'Mahin', email: 'mahin@gmail.com', phone: '9442654321', streetAddress1: '89 Main Street', city: 'Trichy', state: 'Tamil Nadu', pinCode: '620001', country: 'India' },
    shippingDetails: { firstName: 'Abdulla', lastName: 'Mahin', streetAddress1: '89 Main Street', city: 'Trichy', state: 'Tamil Nadu', pinCode: '620001', country: 'India' },
    items: [{ quantity: 1, product: { name: 'Basic Arabic Grammar', price: 170, category: 'Arabic Grammar', imageUrl: '/assets/2.png' } }]
  }
];

export function AdminDashboard() {
  const { user, isAdmin, loginAsAdmin, logoutGuest } = useAuth();

  // Check role from storage
  const [adminRole, setAdminRole] = useState(() => {
    const role = sessionStorage.getItem('admin_role');
    if (role) return role;
    if (sessionStorage.getItem('admin_logged_in') === 'true') {
      return 'orders';
    }
    return '';
  });

  // Check authorization via local sessionStorage or global AuthProvider state
  const [isAuthorized, setIsAuthorized] = useState(() => {
    return sessionStorage.getItem('admin_logged_in') === 'true' || isAdmin;
  });

  // Sync state if AuthProvider updates
  useEffect(() => {
    if (isAdmin) {
      sessionStorage.setItem('admin_logged_in', 'true');
      setIsAuthorized(true);
      if (!sessionStorage.getItem('admin_role')) {
        sessionStorage.setItem('admin_role', 'orders');
        setAdminRole('orders');
      }
    } else if (sessionStorage.getItem('admin_logged_in') !== 'true') {
      setIsAuthorized(false);
    }
  }, [isAdmin]);

  // Active Tab state: 'orders' or 'catalog'
  const [activeTab, setActiveTab] = useState(() => {
    const role = sessionStorage.getItem('admin_role');
    return role === 'catalog' ? 'catalog' : 'orders';
  });

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');


  // Orders State (Combined Demo & Live Database Data)
  const [orders, setOrders] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [isEditingOrder, setIsEditingOrder] = useState(false);

  // Custom Notes Timeline state
  const [customNote, setCustomNote] = useState('');
  const [noteType, setNoteType] = useState('private'); // private or customer

  // Address editing states
  const [isEditingBilling, setIsEditingBilling] = useState(false);
  const [isEditingShipping, setIsEditingShipping] = useState(false);
  const [editBillingForm, setEditBillingForm] = useState({});
  const [editShippingForm, setEditShippingForm] = useState({});

  // Catalog State
  const [books, setBooks] = useState([]);
  const [booksFetching, setBooksFetching] = useState(false);
  const [searchBookQuery, setSearchBookQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStock, setFilterStock] = useState('All');
  const [sortPrice, setSortPrice] = useState('None');
  const [selectedBook, setSelectedBook] = useState(null);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [bookForm, setBookForm] = useState({
    name: '',
    author: '',
    price: '',
    originalPrice: '',
    category: 'Tamil Books',
    stock: '10',
    description: '',
    imageUrl: ''
  });

  // Fetch publications for Catalog Management
  const loadBooks = async () => {
    setBooksFetching(true);
    try {
      const response = await apiFetch('/api/books');
      if (response.ok) {
        const data = await response.json();
        setBooks(data);
      } else {
        toast.error("Failed to load catalog data.");
      }
    } catch (e) {
      console.error("Error loading catalog books:", e);
      toast.error("Catalog database offline.");
    } finally {
      setBooksFetching(false);
    }
  };

  // Run initial book fetch when switching tabs or mounting
  useEffect(() => {
    if (isAuthorized && activeTab === 'catalog') {
      loadBooks();
    }
  }, [isAuthorized, activeTab]);

  // Convert image file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  // Upload image to Cloudinary folder 'Book'
  const handleImageFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size limit (e.g. 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file is too large. Max limit is 5MB.");
      return;
    }

    setUploadingImage(true);
    try {
      const base64String = await fileToBase64(file);
      const response = await apiFetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64String })
      });

      if (response.ok) {
        const result = await response.json();
        setBookForm(prev => ({ ...prev, imageUrl: result.url }));
        toast.success("Image uploaded successfully to Cloudinary folder 'Book'!");
      } else {
        const err = await response.json();
        toast.error(err.error || "Failed to upload image.");
      }
    } catch (err) {
      console.error("Error uploading to Cloudinary:", err);
      toast.error("Image upload failed. Ensure server connection.");
    } finally {
      setUploadingImage(false);
    }
  };

  // Open Book Create/Edit modal
  const handleOpenBookModal = (book = null) => {
    if (book) {
      setSelectedBook(book);
      setBookForm({
        name: book.name || '',
        author: book.author || '',
        price: book.price || '',
        originalPrice: book.originalPrice || '',
        category: book.category || 'Tamil Books',
        stock: book.stock || '10',
        description: book.description || '',
        imageUrl: book.imageUrl || ''
      });
    } else {
      setSelectedBook(null);
      setBookForm({
        name: '',
        author: '',
        price: '',
        originalPrice: '',
        category: 'Tamil Books',
        stock: '10',
        description: '',
        imageUrl: ''
      });
    }
    setIsBookModalOpen(true);
  };

  // Create or Update Book record
  const handleSaveBook = async (e) => {
    e.preventDefault();
    if (!bookForm.name || !bookForm.price || !bookForm.category || !bookForm.imageUrl) {
      toast.error("Please fill in all required fields (Name, Price, Category, Image URL).");
      return;
    }

    const payload = {
      name: bookForm.name,
      author: bookForm.author,
      price: Number(bookForm.price),
      originalPrice: bookForm.originalPrice ? Number(bookForm.originalPrice) : undefined,
      category: bookForm.category,
      stock: Number(bookForm.stock || 0),
      description: bookForm.description,
      imageUrl: bookForm.imageUrl
    };

    try {
      const url = selectedBook ? `/api/books/${selectedBook.id || selectedBook._id}` : '/api/books';
      const method = selectedBook ? 'PUT' : 'POST';

      const response = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const savedBook = await response.json();
        toast.success(selectedBook ? "Publication updated successfully!" : "New publication added to catalog!");
        setIsBookModalOpen(false);
        loadBooks();
      } else {
        const err = await response.json();
        toast.error(err.error || "Failed to save publication.");
      }
    } catch (err) {
      console.error("Error saving book:", err);
      toast.error("Failed to connect to database for saving book.");
    }
  };

  // Delete Book record
  const handleDeleteBook = async (bookId) => {
    if (!confirm("Are you sure you want to permanently delete this publication from catalog?")) return;

    try {
      const response = await apiFetch(`/api/books/${bookId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success("Publication deleted successfully!");
        loadBooks();
      } else {
        const err = await response.json();
        toast.error(err.error || "Failed to delete publication.");
      }
    } catch (err) {
      console.error("Error deleting book:", err);
      toast.error("Failed to connect to database for deleting book.");
    }
  };

  // Fetch live orders and merge with high-fidelity Demo Data
  const loadOrders = async () => {
    setFetching(true);
    try {
      const response = await apiFetch('/api/orders');
      if (response.ok) {
        const liveOrders = await response.json();
        const formattedLive = liveOrders.map(o => ({
          ...o,
          id: o.id || o._id,
          origin: o.origin || 'Direct Checkout',
          customerIp: o.customerIp || '127.0.0.1'
        }));
        
        // Remove duplicate demo orders if they've been committed to database
        const filteredDemos = DEMO_ORDERS.filter(d => !formattedLive.some(l => l.id === d.id));
        setOrders([...formattedLive, ...filteredDemos]);
      } else {
        setOrders(DEMO_ORDERS);
      }
    } catch (e) {
      console.warn("Database offline. Displaying high-fidelity WooCommerce demo dataset.");
      setOrders(DEMO_ORDERS);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      loadOrders();
    }
  }, [isAuthorized]);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const u = username.trim();
    const p = password.trim();

    if (u === 'admin' && p === 'iftadmin') {
      sessionStorage.setItem('admin_logged_in', 'true');
      sessionStorage.setItem('admin_role', 'orders');
      setAdminRole('orders');
      setActiveTab('orders');
      setIsAuthorized(true);
      loginAsAdmin(); // Sync back to AuthProvider
      toast.success("Order Administrator authentication approved!");
    } else if (u === 'book' && p === 'adminbook') {
      sessionStorage.setItem('admin_logged_in', 'true');
      sessionStorage.setItem('admin_role', 'catalog');
      setAdminRole('catalog');
      setActiveTab('catalog');
      setIsAuthorized(true);
      loginAsAdmin(); // Sync back to AuthProvider
      toast.success("Catalog Administrator authentication approved!");
    } else {
      toast.error("Access Denied: Invalid credentials.");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_logged_in');
    sessionStorage.removeItem('admin_role');
    setAdminRole('');
    setIsAuthorized(false);
    logoutGuest(); // Sync back to AuthProvider
    toast.info("Logged out of control center");
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    const isDemo = orderId.toString().startsWith('demo-') || orders.find(o => o.id === orderId)?._id?.startsWith('demo-');
    
    // Optimistic Update
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const updatedHistory = [
          { 
            id: Math.random().toString(), 
            note: `Order status changed from ${o.status.toUpperCase()} to ${newStatus.toUpperCase()}.`, 
            updatedAt: new Date().toISOString() 
          },
          ...(o.statusHistory || [])
        ];
        return { ...o, status: newStatus, statusHistory: updatedHistory };
      }
      return o;
    }));

    toast.success(`Order marked as ${newStatus}`);

    if (!isDemo) {
      try {
        await apiFetch(`/api/orders/${orderId}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: newStatus,
            note: `Order status changed to ${newStatus} by Administrator.`
          })
        });
      } catch (err) {
        console.error("Backend sync failed:", err);
      }
    }
  };

  const handleAddNote = async (orderId) => {
    if (!customNote.trim()) return;
    const notePrefix = noteType === 'customer' ? 'Note to customer: ' : 'Private note: ';
    const fullNote = notePrefix + customNote.trim();

    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const updatedHistory = [
          { id: Math.random().toString(), note: fullNote, updatedAt: new Date().toISOString() },
          ...(o.statusHistory || [])
        ];
        return { ...o, statusHistory: updatedHistory };
      }
      return o;
    }));

    toast.success("Timeline entry logged successfully!");
    setCustomNote('');

    const isDemo = orderId.toString().startsWith('demo-') || orders.find(o => o.id === orderId)?._id?.startsWith('demo-');
    if (!isDemo) {
      try {
        await apiFetch(`/api/orders/${orderId}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ note: fullNote })
        });
      } catch (err) {
        console.error("Backend sync failed:", err);
      }
    }
  };

  const handleDeleteNote = (orderId, noteId) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          statusHistory: (o.statusHistory || []).filter(h => h.id !== noteId)
        };
      }
      return o;
    }));
    toast.info("Timeline note removed.");
  };

  const handleDeleteOrder = async (orderId) => {
    if (!confirm("Are you sure you want to permanently delete this order?")) return;
    
    setOrders(prev => prev.filter(o => o.id !== orderId));
    setIsEditingOrder(false);
    setSelectedOrderId(null);
    toast.success("Order deleted successfully!");

    const isDemo = orderId.toString().startsWith('demo-') || orders.find(o => o.id === orderId)?._id?.startsWith('demo-');
    if (!isDemo) {
      try {
        await apiFetch(`/api/orders/${orderId}`, { method: 'DELETE' });
      } catch (err) {
        console.error("Backend deletion failed:", err);
      }
    }
  };

  const handleSaveBilling = async (orderId) => {
    const isDemo = orderId.toString().startsWith('demo-') || orders.find(o => o.id === orderId)?._id?.startsWith('demo-');
    
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const updatedHistory = [
          {
            id: Math.random().toString(),
            note: 'Billing details updated by Administrator.',
            updatedAt: new Date().toISOString()
          },
          ...(o.statusHistory || [])
        ];
        return {
          ...o,
          billingDetails: editBillingForm,
          statusHistory: updatedHistory
        };
      }
      return o;
    }));

    toast.success("Billing details updated successfully!");
    setIsEditingBilling(false);

    if (!isDemo) {
      try {
        await apiFetch(`/api/orders/${orderId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ billingDetails: editBillingForm })
        });
      } catch (err) {
        console.error("Backend billing sync failed:", err);
      }
    }
  };

  const handleSaveShipping = async (orderId) => {
    const isDemo = orderId.toString().startsWith('demo-') || orders.find(o => o.id === orderId)?._id?.startsWith('demo-');
    
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const updatedHistory = [
          {
            id: Math.random().toString(),
            note: 'Shipping details updated by Administrator.',
            updatedAt: new Date().toISOString()
          },
          ...(o.statusHistory || [])
        ];
        return {
          ...o,
          shippingDetails: editShippingForm,
          statusHistory: updatedHistory
        };
      }
      return o;
    }));

    toast.success("Shipping details updated successfully!");
    setIsEditingShipping(false);

    if (!isDemo) {
      try {
        await apiFetch(`/api/orders/${orderId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ shippingDetails: editShippingForm })
        });
      } catch (err) {
        console.error("Backend shipping sync failed:", err);
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-[#d0e0eb] hover:bg-[#d0e0eb] text-[#3c6a84] border-[#b0c8d6] font-bold py-1 px-3.5 text-xs rounded shadow-none border">Completed</Badge>;
      case 'failed':
        return <Badge className="bg-[#f2d7d5] hover:bg-[#f2d7d5] text-[#922b21] border-[#e6b0aa] font-bold py-1 px-3.5 text-xs rounded shadow-none border">Failed</Badge>;
      case 'cancelled':
        return <Badge className="bg-[#eaecee] hover:bg-[#eaecee] text-[#5d6d7e] border-[#d5dbdb] font-bold py-1 px-3.5 text-xs rounded shadow-none border">Cancelled</Badge>;
      case 'processing':
        return <Badge className="bg-emerald-50 hover:bg-emerald-50 text-emerald-700 border-emerald-200 font-bold py-1 px-3.5 text-xs rounded shadow-none border">Processing</Badge>;
      case 'pending':
        return <Badge className="bg-amber-50 hover:bg-amber-50 text-amber-700 border-amber-200 font-bold py-1 px-3.5 text-xs rounded shadow-none border">Pending Payment</Badge>;
      default:
        return <Badge className="bg-slate-50 text-slate-700 font-bold py-1 px-3.5 text-xs rounded border">{status}</Badge>;
    }
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 24) {
      return diffHours === 0 ? 'Just now' : `${diffHours} hours ago`;
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Secure Auth Login Page at the starting of Admin Panel
  if (!isAuthorized) {
    return (
      <div className="admin-login-page">
        <Card className="admin-login-card">
          <div className="admin-login-decor"></div>
          
          <div className="admin-login-header">
            <div className="admin-login-icon">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h1>Admin Control Center</h1>
            <p>Verify credentials to manage store orders and invoices.</p>
          </div>

          <CardContent className="p-8">
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="admin-form-group">
                <label>Admin Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="admin-form-input"
                />
              </div>
              
              <div className="admin-form-group">
                <label>Admin Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Enter security key"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="admin-form-input"
                />
              </div>

              <div className="admin-dev-box space-y-1">
                <div>🔧 <span className="underline">Order Tracker Admin:</span> admin / iftadmin</div>
                <div>📖 <span className="underline">Catalog Editor Admin:</span> book / adminbook</div>
              </div>

              <Button type="submit" size="lg" className="admin-login-btn">
                Authorize Credentials
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedOrder = orders.find(o => o.id === selectedOrderId);

  return (
    <div className="admin-dashboard-page">
      <div className="admin-container">
        
        {/* VIEW 1: High Fidelity Orders Listing View (Screenshot 3) */}
        {!isEditingOrder ? (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Tabs Selector & Logout Navigation Row */}
            <div className="admin-nav-header">
              <div className="admin-tabs-nav">
                {(!adminRole || adminRole === 'orders') && (
                  <button 
                    onClick={() => setActiveTab('orders')}
                    className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Orders Pipeline
                  </button>
                )}
                {(!adminRole || adminRole === 'catalog') && (
                  <button 
                    onClick={() => {
                      setActiveTab('catalog');
                      loadBooks();
                    }}
                    className={`admin-tab-btn ${activeTab === 'catalog' ? 'active' : ''}`}
                  >
                    <BookOpen className="h-4 w-4" />
                    Catalog Publications
                  </button>
                )}
              </div>
              <Button variant="destructive" size="sm" onClick={handleLogout} className="rounded-2xl h-9 font-bold text-white px-4">
                Logout Control Center
              </Button>
            </div>

            {activeTab === 'orders' ? (
              <>
                <div className="admin-header-bar">
                  <div className="admin-title-group">
                    <div className="admin-title-icon">
                      <ShoppingBag className="h-7 w-7" />
                    </div>
                    <div>
                      <h1>Orders</h1>
                      <p>Realtime checkout pipeline and transaction index.</p>
                    </div>
                  </div>
                  <div className="admin-btn-group">
                    <Button variant="outline" size="sm" onClick={loadOrders} className="rounded-2xl h-10 border-slate-200 font-bold hover:bg-slate-50">
                      <RefreshCw className={`h-4 w-4 mr-2 ${fetching ? 'animate-spin' : ''}`} /> Sync Database
                    </Button>
                  </div>
                </div>

                {/* Premium WooCommerce Table Grid */}
                <div className="admin-table-wrapper">
                  <div className="overflow-x-auto">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th className="p-4 text-center w-12"><input type="checkbox" className="rounded" /></th>
                          <th className="p-4 text-left">Order</th>
                          <th className="p-4 text-left">Date</th>
                          <th className="p-4 text-left">Status</th>
                          <th className="p-4 text-right">Total</th>
                          <th className="p-4 text-left">Origin</th>
                          <th className="p-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {orders.map((o) => {
                          const billName = o.billingDetails?.firstName 
                            ? `${o.billingDetails.firstName} ${o.billingDetails.lastName || ''}`
                            : 'Guest Reader';
                          return (
                            <tr key={o.id}>
                              <td className="p-4 text-center"><input type="checkbox" className="rounded border-slate-300" /></td>
                              <td className="p-4 text-left">
                                <span 
                                  onClick={() => {
                                    setSelectedOrderId(o.id);
                                    setIsEditingOrder(true);
                                  }}
                                  className="admin-order-link"
                                >
                                  #{o.id} {billName}
                                </span>
                              </td>
                              <td className="p-4 text-left"><span className="admin-time-label">{formatTimeAgo(o.createdAt)}</span></td>
                              <td className="p-4 text-left">{getStatusBadge(o.status)}</td>
                              <td className="p-4 text-right"><span className="admin-total-label">₹{Number(o.total || 0).toFixed(0)}</span></td>
                              <td className="p-4 text-left"><span className="admin-origin-label">{o.origin || 'Organic: Google'}</span></td>
                              <td className="p-4 text-center">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => {
                                    setSelectedOrderId(o.id);
                                    setIsEditingOrder(true);
                                  }}
                                  className="h-8 w-8 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              /* Catalog Management Section */
              <div className="space-y-6">
                <div className="admin-header-bar">
                  <div className="admin-title-group">
                    <div className="admin-title-icon">
                      <BookOpen className="h-7 w-7" />
                    </div>
                    <div>
                      <h1>Catalog Publications</h1>
                      <p>Create, update, and delete catalog books and manage their assets on Cloudinary.</p>
                    </div>
                  </div>
                  <div className="admin-btn-group">
                    <Button onClick={() => handleOpenBookModal()} className="rounded-2xl h-10 font-bold bg-[#388e3c] hover:bg-[#2e7d32] text-white">
                      <Plus className="h-4 w-4 mr-2" /> Add Publication
                    </Button>
                    <Button variant="outline" size="sm" onClick={loadBooks} className="rounded-2xl h-10 border-slate-200 font-bold hover:bg-slate-50">
                      <RefreshCw className={`h-4 w-4 mr-2 ${booksFetching ? 'animate-spin' : ''}`} /> Sync Catalog
                    </Button>
                  </div>
                </div>

                {/* Search & Filters Controls */}
                <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
                  {/* Search Bar */}
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex items-center gap-3">
                    <Search className="h-5 w-5 text-slate-400" />
                    <input 
                      type="text"
                      placeholder="Search catalog by name, author, or category..."
                      value={searchBookQuery}
                      onChange={(e) => setSearchBookQuery(e.target.value)}
                      className="w-full text-sm outline-none border-none bg-transparent placeholder-slate-400 font-medium text-slate-700"
                    />
                  </div>

                  {/* Filters Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Category Filter */}
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[10px] uppercase font-bold text-slate-400">Filter by Category</label>
                      <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 h-10 text-xs font-bold text-slate-600 outline-none focus:border-[#388e3c]"
                      >
                        <option value="All">All Categories</option>
                        <option value="Tamil Books">Tamil Books</option>
                        <option value="Arabic Books">Arabic Books</option>
                        <option value="English Books">English Books</option>
                        <option value="Urdu Books">Urdu Books</option>
                        <option value="E-Books">E-Books (PDF)</option>
                        <option value="E-Pub">E-Pub (EPUB)</option>
                      </select>
                    </div>

                    {/* Stock Filter */}
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[10px] uppercase font-bold text-slate-400">Filter by Stock</label>
                      <select
                        value={filterStock}
                        onChange={(e) => setFilterStock(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 h-10 text-xs font-bold text-slate-600 outline-none focus:border-[#388e3c]"
                      >
                        <option value="All">All Stock Levels</option>
                        <option value="In Stock">In Stock (&gt; 0)</option>
                        <option value="Low Stock">Low Stock (&lt;= 4)</option>
                        <option value="Out of Stock">Out of Stock (= 0)</option>
                      </select>
                    </div>

                    {/* Price Filter */}
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[10px] uppercase font-bold text-slate-400">Sort by Price</label>
                      <select
                        value={sortPrice}
                        onChange={(e) => setSortPrice(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 h-10 text-xs font-bold text-slate-600 outline-none focus:border-[#388e3c]"
                      >
                        <option value="None">No Price Sorting</option>
                        <option value="LowToHigh">Price: Low to High</option>
                        <option value="HighToLow">Price: High to Low</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Catalog Table */}
                <div className="admin-table-wrapper">
                  <div className="overflow-x-auto">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th className="p-4 text-left w-20">Image</th>
                          <th className="p-4 text-left">Publication Details</th>
                          <th className="p-4 text-left">Category</th>
                          <th className="p-4 text-right">Price</th>
                          <th className="p-4 text-center">Stock</th>
                          <th className="p-4 text-center">Rating</th>
                          <th className="p-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {books
                          .filter(b => {
                            const matchesSearch = 
                              (b.name || '').toLowerCase().includes(searchBookQuery.toLowerCase()) || 
                              (b.author || '').toLowerCase().includes(searchBookQuery.toLowerCase()) ||
                              (b.category || '').toLowerCase().includes(searchBookQuery.toLowerCase());
                            
                            const matchesCategory = filterCategory === 'All' || b.category === filterCategory;
                            
                            let matchesStock = true;
                            if (filterStock === 'In Stock') {
                              matchesStock = b.stock > 0;
                            } else if (filterStock === 'Low Stock') {
                              matchesStock = b.stock <= 4;
                            } else if (filterStock === 'Out of Stock') {
                              matchesStock = b.stock === 0;
                            }
                            
                            return matchesSearch && matchesCategory && matchesStock;
                          })
                          .sort((a, b) => {
                            if (sortPrice === 'LowToHigh') {
                              return a.price - b.price;
                            } else if (sortPrice === 'HighToLow') {
                              return b.price - a.price;
                            }
                            return 0;
                          })
                          .map((b) => {
                            const isLowStock = b.stock <= 4;
                            return (
                              <tr key={b.id || b._id}>
                                <td className="p-4 text-left">
                                  <div className="h-14 w-11 rounded-lg overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center shadow-sm">
                                    <img 
                                      src={b.imageUrl} 
                                      alt={b.name} 
                                      className="h-full w-full object-cover"
                                      onError={(e) => { e.target.src = '/assets/logo.png'; }}
                                    />
                                  </div>
                                </td>
                                <td className="p-4 text-left">
                                  <div className="space-y-1">
                                    <span className="font-bold text-slate-800 text-sm block leading-tight">{b.name}</span>
                                    <span className="text-slate-400 text-xs font-semibold block">{b.author || 'IFT Scholar'}</span>
                                  </div>
                                </td>
                                <td className="p-4 text-left">
                                  <span className="admin-origin-label text-slate-600 bg-slate-50 px-2.5 py-1 rounded-full text-[11px] font-bold border border-slate-100/60">{b.category}</span>
                                </td>
                                <td className="p-4 text-right">
                                  <div className="space-y-0.5">
                                    <span className="admin-total-label block">₹{b.price}</span>
                                    {b.originalPrice && (
                                      <span className="text-slate-400 line-through text-xs font-bold font-mono">₹{b.originalPrice}</span>
                                    )}
                                  </div>
                                </td>
                                <td className="p-4 text-center">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${
                                    isLowStock 
                                      ? 'bg-rose-50 text-rose-700 border border-rose-100' 
                                      : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                  }`}>
                                    {b.stock} copies
                                  </span>
                                </td>
                                <td className="p-4 text-center">
                                  <div className="text-xs font-bold text-amber-500 font-mono">
                                    ★ {b.rating || '4.5'}
                                    <span className="text-slate-400 text-[10px] block font-semibold">({b.reviewCount || 0} reviews)</span>
                                  </div>
                                </td>
                                <td className="p-4 text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      onClick={() => handleOpenBookModal(b)}
                                      className="h-8 w-8 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50"
                                      title="Edit Publication"
                                    >
                                      <Edit3 className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      onClick={() => handleDeleteBook(b.id || b._id)}
                                      className="h-8 w-8 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                                      title="Delete Publication"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        {books.length === 0 && (
                          <tr>
                            <td colSpan="7" className="p-8 text-center text-slate-400 font-semibold italic">
                              {booksFetching ? 'Loading catalog publications...' : 'No books found in the catalog.'}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          
          /* VIEW 2: Edit Order Details Page (Screenshot 1 & 2) */
          <div className="space-y-6 animate-in slide-in-from-left duration-300">
            
            {/* Header Area */}
            <div className="admin-header-bar">
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsEditingOrder(false)} 
                  className="rounded-full h-10 w-10 border hover:bg-slate-50 mr-2"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-xl font-bold font-serif text-slate-900">Edit Order</h1>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">Review billing records and publish timeline notes.</p>
                </div>
              </div>
              <div>
                <Button variant="outline" size="sm" className="rounded-2xl border-slate-200 font-bold text-xs h-10 px-4 hover:bg-slate-50">
                  Activity
                </Button>
              </div>
            </div>

            {selectedOrder ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left 8 Columns: Info, addresses, items table */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* General order summary panel */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-4">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">
                          Order #{selectedOrder.id} details
                        </h2>
                        <p className="text-xs text-slate-400 font-medium mt-1 leading-relaxed">
                          Payment via Online ({selectedOrder.razorpayPaymentId || 'pay_StelwdIWIZatmQ'}). Paid on {new Date(selectedOrder.createdAt).toLocaleDateString('en-GB')} @ {new Date(selectedOrder.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}. Customer IP: {selectedOrder.customerIp || '2401:4900:4dd6:1e2e:bab6:cdda:ee9b:b29d'}
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeleteOrder(selectedOrder.id)}
                        className="text-rose-600 hover:bg-rose-50 rounded-xl h-9 border border-rose-100"
                      >
                        <Trash2 className="h-4 w-4 mr-1.5" /> Delete Order
                      </Button>
                    </div>

                    {/* Address comparison block (Screenshot 2 style) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs leading-relaxed text-slate-600 pt-2">
                      
                      {/* Billing card */}
                      <div className="space-y-3 p-4 rounded-2xl bg-slate-50/50 border border-slate-100 relative">
                        <div className="flex justify-between items-center border-b pb-1.5">
                          <h4 className="font-bold text-slate-800 text-sm">Billing</h4>
                          {!isEditingBilling && (
                            <Edit3 
                              className="h-3.5 w-3.5 text-slate-400 cursor-pointer hover:text-slate-600" 
                              onClick={() => {
                                setEditBillingForm(selectedOrder.billingDetails || {});
                                setIsEditingBilling(true);
                              }}
                            />
                          )}
                        </div>
                        {isEditingBilling ? (
                          <div className="space-y-2 text-left">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[9px] uppercase font-bold text-slate-400">First Name</label>
                                <input 
                                  type="text" 
                                  value={editBillingForm.firstName || ''} 
                                  onChange={(e) => setEditBillingForm({ ...editBillingForm, firstName: e.target.value })}
                                  className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-[11px] outline-none font-semibold text-slate-800"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] uppercase font-bold text-slate-400">Last Name</label>
                                <input 
                                  type="text" 
                                  value={editBillingForm.lastName || ''} 
                                  onChange={(e) => setEditBillingForm({ ...editBillingForm, lastName: e.target.value })}
                                  className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-[11px] outline-none font-semibold text-slate-800"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-[9px] uppercase font-bold text-slate-400">Street Address</label>
                              <input 
                                type="text" 
                                value={editBillingForm.streetAddress1 || ''} 
                                onChange={(e) => setEditBillingForm({ ...editBillingForm, streetAddress1: e.target.value })}
                                className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-[11px] outline-none font-semibold text-slate-800 mb-1"
                                placeholder="Line 1"
                              />
                              <input 
                                type="text" 
                                value={editBillingForm.streetAddress2 || ''} 
                                onChange={(e) => setEditBillingForm({ ...editBillingForm, streetAddress2: e.target.value })}
                                className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-[11px] outline-none font-semibold text-slate-800"
                                placeholder="Line 2"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[9px] uppercase font-bold text-slate-400">City</label>
                                <input 
                                  type="text" 
                                  value={editBillingForm.city || ''} 
                                  onChange={(e) => setEditBillingForm({ ...editBillingForm, city: e.target.value })}
                                  className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-[11px] outline-none font-semibold text-slate-800"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] uppercase font-bold text-slate-400">State</label>
                                <input 
                                  type="text" 
                                  value={editBillingForm.state || ''} 
                                  onChange={(e) => setEditBillingForm({ ...editBillingForm, state: e.target.value })}
                                  className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-[11px] outline-none font-semibold text-slate-800"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[9px] uppercase font-bold text-slate-400">PIN Code</label>
                                <input 
                                  type="text" 
                                  value={editBillingForm.pinCode || ''} 
                                  onChange={(e) => setEditBillingForm({ ...editBillingForm, pinCode: e.target.value })}
                                  className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-[11px] outline-none font-semibold text-slate-800"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] uppercase font-bold text-slate-400">Phone</label>
                                <input 
                                  type="text" 
                                  value={editBillingForm.phone || ''} 
                                  onChange={(e) => setEditBillingForm({ ...editBillingForm, phone: e.target.value })}
                                  className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-[11px] outline-none font-semibold text-slate-800"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-[9px] uppercase font-bold text-slate-400">Email</label>
                              <input 
                                type="email" 
                                value={editBillingForm.email || ''} 
                                onChange={(e) => setEditBillingForm({ ...editBillingForm, email: e.target.value })}
                                className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-[11px] outline-none font-semibold text-slate-800"
                              />
                            </div>
                            <div className="flex gap-2 pt-2">
                              <Button 
                                size="sm" 
                                onClick={() => handleSaveBilling(selectedOrder.id)} 
                                className="h-8 text-[10px] font-bold bg-[#388e3c] hover:bg-[#2e7d32] text-white rounded-lg px-3"
                              >
                                Save Address
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => setIsEditingBilling(false)} 
                                className="h-8 text-[10px] font-bold text-slate-500 hover:bg-slate-100 rounded-lg px-3"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : selectedOrder.billingDetails ? (
                          <div className="space-y-1">
                            <p className="font-bold text-slate-800 uppercase">{selectedOrder.billingDetails.firstName} {selectedOrder.billingDetails.lastName || ''}</p>
                            <p className="font-medium">
                              {selectedOrder.billingDetails.streetAddress1}<br />
                              {selectedOrder.billingDetails.streetAddress2 && <>{selectedOrder.billingDetails.streetAddress2}<br /></>}
                              {selectedOrder.billingDetails.city}<br />
                              {selectedOrder.billingDetails.state}, {selectedOrder.billingDetails.country}
                            </p>
                            <div className="pt-2 space-y-1">
                              <p className="flex items-center gap-1.5 text-slate-400"><Mail className="h-3 w-3 shrink-0" /> <span className="text-[#3c6a84] hover:underline cursor-pointer font-bold">{selectedOrder.billingDetails.email || 'mdsulai76@gmail.com'}</span></p>
                              <p className="flex items-center gap-1.5 text-slate-400"><Phone className="h-3 w-3 shrink-0" /> <span className="text-[#3c6a84] hover:underline cursor-pointer font-bold">{selectedOrder.billingDetails.phone || '9944360360'}</span></p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-slate-400 italic font-semibold">No billing record found.</p>
                        )}
                      </div>

                      {/* Shipping card */}
                      <div className="space-y-3 p-4 rounded-2xl bg-slate-50/50 border border-slate-100 relative">
                        <div className="flex justify-between items-center border-b pb-1.5">
                          <h4 className="font-bold text-slate-800 text-sm">Shipping</h4>
                          {!isEditingShipping && (
                            <Edit3 
                              className="h-3.5 w-3.5 text-slate-400 cursor-pointer hover:text-slate-600" 
                              onClick={() => {
                                setEditShippingForm(selectedOrder.shippingDetails || {});
                                setIsEditingShipping(true);
                              }}
                            />
                          )}
                        </div>
                        {isEditingShipping ? (
                          <div className="space-y-2 text-left">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[9px] uppercase font-bold text-slate-400">First Name</label>
                                <input 
                                  type="text" 
                                  value={editShippingForm.firstName || ''} 
                                  onChange={(e) => setEditShippingForm({ ...editShippingForm, firstName: e.target.value })}
                                  className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-[11px] outline-none font-semibold text-slate-800"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] uppercase font-bold text-slate-400">Last Name</label>
                                <input 
                                  type="text" 
                                  value={editShippingForm.lastName || ''} 
                                  onChange={(e) => setEditShippingForm({ ...editShippingForm, lastName: e.target.value })}
                                  className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-[11px] outline-none font-semibold text-slate-800"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-[9px] uppercase font-bold text-slate-400">Street Address</label>
                              <input 
                                type="text" 
                                value={editShippingForm.streetAddress1 || ''} 
                                onChange={(e) => setEditShippingForm({ ...editShippingForm, streetAddress1: e.target.value })}
                                className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-[11px] outline-none font-semibold text-slate-800 mb-1"
                                placeholder="Line 1"
                              />
                              <input 
                                type="text" 
                                value={editShippingForm.streetAddress2 || ''} 
                                onChange={(e) => setEditShippingForm({ ...editShippingForm, streetAddress2: e.target.value })}
                                className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-[11px] outline-none font-semibold text-slate-800"
                                placeholder="Line 2"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[9px] uppercase font-bold text-slate-400">City</label>
                                <input 
                                  type="text" 
                                  value={editShippingForm.city || ''} 
                                  onChange={(e) => setEditShippingForm({ ...editShippingForm, city: e.target.value })}
                                  className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-[11px] outline-none font-semibold text-slate-800"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] uppercase font-bold text-slate-400">State</label>
                                <input 
                                  type="text" 
                                  value={editShippingForm.state || ''} 
                                  onChange={(e) => setEditShippingForm({ ...editShippingForm, state: e.target.value })}
                                  className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-[11px] outline-none font-semibold text-slate-800"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[9px] uppercase font-bold text-slate-400">PIN Code</label>
                                <input 
                                  type="text" 
                                  value={editShippingForm.pinCode || ''} 
                                  onChange={(e) => setEditShippingForm({ ...editShippingForm, pinCode: e.target.value })}
                                  className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-[11px] outline-none font-semibold text-slate-800"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] uppercase font-bold text-slate-400">Country</label>
                                <input 
                                  type="text" 
                                  value={editShippingForm.country || 'India'} 
                                  onChange={(e) => setEditShippingForm({ ...editShippingForm, country: e.target.value })}
                                  className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-[11px] outline-none font-semibold text-slate-800"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-[9px] uppercase font-bold text-slate-400">Order Notes / Shipping Note</label>
                              <textarea 
                                value={editShippingForm.orderNotes || ''} 
                                onChange={(e) => setEditShippingForm({ ...editShippingForm, orderNotes: e.target.value })}
                                rows={2}
                                className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-[11px] outline-none font-semibold text-slate-800 resize-none"
                              />
                            </div>
                            <div className="flex gap-2 pt-2">
                              <Button 
                                size="sm" 
                                onClick={() => handleSaveShipping(selectedOrder.id)} 
                                className="h-8 text-[10px] font-bold bg-[#388e3c] hover:bg-[#2e7d32] text-white rounded-lg px-3"
                              >
                                Save Address
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => setIsEditingShipping(false)} 
                                className="h-8 text-[10px] font-bold text-slate-500 hover:bg-slate-100 rounded-lg px-3"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : selectedOrder.shippingDetails ? (
                          <div className="space-y-1 font-medium">
                            <p className="font-bold text-slate-800 uppercase">{selectedOrder.shippingDetails.firstName} {selectedOrder.shippingDetails.lastName || ''}</p>
                            <p>
                              {selectedOrder.shippingDetails.streetAddress1}<br />
                              {selectedOrder.shippingDetails.streetAddress2 && <>{selectedOrder.shippingDetails.streetAddress2}<br /></>}
                              {selectedOrder.shippingDetails.city}<br />
                              {selectedOrder.shippingDetails.state}, {selectedOrder.shippingDetails.country}
                            </p>
                            <p className="text-slate-500 pt-2">Shipping method: <span className="font-bold text-slate-700">Shipping Charges</span></p>
                            {selectedOrder.shippingDetails.orderNotes && (
                              <p className="text-slate-400 italic mt-1 font-semibold">"Note: {selectedOrder.shippingDetails.orderNotes}"</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-slate-400 italic font-semibold">No shipping address recorded.</p>
                        )}
                      </div>

                    </div>
                  </div>

                  {/* Publications Order Item list (Screenshot 1) */}
                  <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                    <div className="p-4 border-b bg-slate-50/50">
                      <h3 className="text-sm font-bold text-slate-700 tracking-tight">Publication Items</h3>
                    </div>

                    <table className="w-full text-xs text-slate-600">
                      <thead>
                        <tr className="bg-slate-50/30 border-b text-slate-500 font-bold uppercase text-[9px] tracking-wider">
                          <th className="p-4 text-left">Item</th>
                          <th className="p-4 text-right">Price</th>
                          <th className="p-4 text-center">Qty</th>
                          <th className="p-4 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedOrder.items.map((item, idx) => {
                          const prod = item.product || {};
                          return (
                            <tr key={idx} className="hover:bg-slate-50/50">
                              <td className="p-4 text-left flex items-center gap-3">
                                <img 
                                  src={prod.imageUrl || '/assets/1.png'} 
                                  alt={prod.name} 
                                  className="h-10 w-8 object-cover rounded shadow-sm border" 
                                />
                                <div>
                                  <p className="font-bold text-[#3c6a84] hover:underline cursor-pointer">{prod.name || 'Noble Publication Book'}</p>
                                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">{prod.category || 'Books'}</p>
                                </div>
                              </td>
                              <td className="p-4 text-right font-semibold text-slate-800">₹{Number(prod.price || 0).toFixed(0)}</td>
                              <td className="p-4 text-center font-bold text-slate-900">× {item.quantity}</td>
                              <td className="p-4 text-right font-bold text-slate-900">₹{Number((prod.price || 0) * item.quantity).toFixed(0)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    {/* WooCommerce Summation Box */}
                    <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-end">
                      <div className="w-full max-w-[260px] space-y-2 text-xs">
                        <div className="flex justify-between font-medium text-slate-500">
                          <span>Items Subtotal:</span>
                          <span className="font-bold text-slate-800">₹{(selectedOrder.total - (selectedOrder.total > 500 ? 0 : 30)).toFixed(0)}</span>
                        </div>
                        
                        <div className="flex justify-between font-medium text-slate-500">
                          <span>Shipping:</span>
                          <span className="font-bold text-slate-800">₹{selectedOrder.total > 500 ? '0' : '30'}</span>
                        </div>
                        
                        <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-200/60 pt-2">
                          <span>Order Total:</span>
                          <span className="font-bold text-[#388e3c] font-mono text-base">₹{selectedOrder.total.toFixed(0)}</span>
                        </div>
                        
                        <div className="flex justify-between font-semibold text-[10px] text-slate-400 uppercase tracking-wide pt-1 border-t border-dashed">
                          <span>Paid online:</span>
                          <span className="text-slate-600 font-bold">₹{selectedOrder.total.toFixed(0)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Right 4 Columns: Actions, notes feed */}
                <div className="lg:col-span-4 space-y-6">
                  
                  {/* General order metrics */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Average order value</h4>
                    <p className="text-3xl font-extrabold text-slate-800 font-mono">₹463</p>
                  </div>

                  {/* WooCommerce Order actions dropdown */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Order actions</h4>
                    <div className="space-y-2">
                      <select 
                        value={selectedOrder.status}
                        onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-2 h-9 text-xs outline-none focus:border-[#388e3c] font-semibold text-slate-700"
                      >
                        <option value="pending">Pending Payment</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="failed">Failed</option>
                      </select>
                      <Button className="w-full text-xs font-bold h-9 bg-slate-100 hover:bg-slate-200 text-slate-700 border-none rounded-xl" onClick={() => toast.success("Notification updated!")}>
                        Update Status
                      </Button>
                    </div>
                  </div>

                  {/* WooCommerce Chronological timeline feed (Screenshot 1 style) */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Order notes</h4>
                    
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                      {selectedOrder.statusHistory && selectedOrder.statusHistory.map((note) => {
                        const isCustomer = note.note?.startsWith('Note to customer:');
                        return (
                          <div 
                            key={note.id} 
                            className={`p-3 rounded-xl border text-[11px] leading-relaxed text-left relative group transition-all ${
                              isCustomer 
                                ? 'bg-[#fcf9f5] border-amber-100 text-amber-900' 
                                : 'bg-slate-50/50 border-slate-100 text-slate-700'
                            }`}
                          >
                            <p className="font-medium pr-4">{note.note}</p>
                            <span className="text-[9px] text-slate-400 font-bold block mt-1">
                              {new Date(note.updatedAt || Date.now()).toLocaleDateString('en-GB')} at {new Date(note.updatedAt || Date.now()).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <button 
                              onClick={() => handleDeleteNote(selectedOrder.id, note.id)}
                              className="absolute right-2 top-2 text-rose-500 hover:text-rose-700 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Delete Note"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        );
                      })}
                      
                      {(!selectedOrder.statusHistory || selectedOrder.statusHistory.length === 0) && (
                        <p className="text-slate-400 italic text-[10px] font-semibold">No timeline entries captured.</p>
                      )}
                    </div>
                    
                    {/* Add note section */}
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <label className="text-[10px] uppercase font-bold text-slate-400 block text-left">Add note</label>
                      <textarea 
                        value={customNote}
                        onChange={(e) => setCustomNote(e.target.value)}
                        placeholder="Type new timeline entry..."
                        rows={3}
                        className="w-full text-xs bg-slate-50/30 border border-slate-200 rounded-xl p-2 outline-none focus:border-[#388e3c] resize-none"
                      />
                      <div className="flex items-center justify-between gap-2">
                        <select 
                          value={noteType} 
                          onChange={(e) => setNoteType(e.target.value)}
                          className="bg-white border rounded-lg text-[10px] px-1 h-7 font-bold text-slate-500 outline-none"
                        >
                          <option value="private">Private note</option>
                          <option value="customer">Note to customer</option>
                        </select>
                        <Button 
                          size="sm" 
                          onClick={() => handleAddNote(selectedOrder.id)}
                          className="text-[10px] font-bold h-7 bg-[#388e3c] hover:bg-[#2e7d32] text-white px-3 rounded-lg"
                        >
                          Add Note
                        </Button>
                      </div>
                    </div>

                  </div>

                </div>

              </div>
            ) : (
              <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-12 text-center text-slate-400 font-semibold">
                Order not found.
              </div>
            )}
          </div>
        )}

        {/* Book Add/Edit Modal Dialog */}
        {isBookModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="text-left">
                  <h2 className="text-lg font-bold font-serif text-slate-900">
                    {selectedBook ? "Edit Catalog Publication" : "Add New Publication"}
                  </h2>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">
                    Provide title details, pricing details, and upload image assets.
                  </p>
                </div>
                <button 
                  onClick={() => setIsBookModalOpen(false)}
                  className="rounded-full h-8 w-8 border border-slate-200 hover:bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSaveBook} className="flex flex-col flex-1 overflow-hidden">
                {/* Scrollable Form Body */}
                <div className="p-6 overflow-y-auto space-y-4 flex-1 text-left">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    <div className="admin-form-group col-span-2">
                      <label>Book Title *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. Introduction to Islam"
                        value={bookForm.name}
                        onChange={e => setBookForm(prev => ({ ...prev, name: e.target.value }))}
                        className="admin-form-input"
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>Author / Scholar Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Dr. V. Abdur Rahim"
                        value={bookForm.author}
                        onChange={e => setBookForm(prev => ({ ...prev, author: e.target.value }))}
                        className="admin-form-input"
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>Category *</label>
                      <select
                        value={bookForm.category}
                        onChange={e => setBookForm(prev => ({ ...prev, category: e.target.value }))}
                        className="admin-form-input bg-[#f8fafc] px-3 font-semibold text-slate-700 outline-none"
                      >
                        <option value="Tamil Books">Tamil Books</option>
                        <option value="Arabic Books">Arabic Books</option>
                        <option value="English Books">English Books</option>
                        <option value="Urdu Books">Urdu Books</option>
                        <option value="E-Books">E-Books (PDF)</option>
                        <option value="E-Pub">E-Pub (EPUB)</option>
                      </select>
                    </div>

                    <div className="admin-form-group">
                      <label>Price (₹) *</label>
                      <input 
                        type="number" 
                        required
                        min="0"
                        step="any"
                        placeholder="e.g. 280"
                        value={bookForm.price}
                        onChange={e => setBookForm(prev => ({ ...prev, price: e.target.value }))}
                        className="admin-form-input"
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>Original Price (₹) (Optional)</label>
                      <input 
                        type="number" 
                        min="0"
                        step="any"
                        placeholder="e.g. 350"
                        value={bookForm.originalPrice}
                        onChange={e => setBookForm(prev => ({ ...prev, originalPrice: e.target.value }))}
                        className="admin-form-input"
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>Stock Count *</label>
                      <input 
                        type="number" 
                        required
                        min="0"
                        placeholder="e.g. 25"
                        value={bookForm.stock}
                        onChange={e => setBookForm(prev => ({ ...prev, stock: e.target.value }))}
                        className="admin-form-input"
                      />
                    </div>

                    <div className="admin-form-group col-span-2 col-span-md-2">
                      <label>Description</label>
                      <textarea 
                        placeholder="Brief overview or description of the book..."
                        value={bookForm.description}
                        onChange={e => setBookForm(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        className="admin-form-input py-2 h-auto resize-none"
                      />
                    </div>

                    {/* Cloudinary Image Asset Upload Area */}
                    <div className="admin-form-group col-span-2 border border-dashed border-slate-200 rounded-2xl p-4 bg-slate-50/50">
                      <label className="mb-2 block text-left">Cloudinary Image Asset *</label>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                        {/* Image Preview Container */}
                        <div className="sm:col-span-1 h-28 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-inner flex items-center justify-center relative">
                          {bookForm.imageUrl ? (
                            <img 
                              src={bookForm.imageUrl} 
                              alt="Book Preview" 
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center p-2">
                              No Asset
                            </div>
                          )}
                        </div>

                        {/* Dropzone / Upload controls */}
                        <div className="sm:col-span-3 space-y-3 text-left">
                          <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl p-6 bg-white hover:bg-slate-50/50 transition-all cursor-pointer min-h-[140px] text-center shadow-sm">
                            <input 
                              type="file" 
                              accept="image/*"
                              onChange={handleImageFileChange}
                              disabled={uploadingImage}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                            />
                            <Upload className="h-8 w-8 text-slate-400 mb-2 transition-transform duration-200 hover:scale-110" />
                            <span className="text-xs font-bold text-slate-600">
                              {uploadingImage ? 'Uploading cover art...' : 'Drag & drop cover here, or click to browse'}
                            </span>
                            <span className="text-[10px] text-slate-400 mt-1 font-semibold">
                              Supports PNG, JPG, JPEG (Max 5MB)
                            </span>
                          </div>

                          {/* Loading Indicator */}
                          {uploadingImage && (
                            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 text-left">
                              <div className="h-3.5 w-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                              Uploading cover art directly to Cloudinary 'Book' folder...
                            </div>
                          )}

                          {/* Raw URL Input */}
                          <div className="space-y-1 text-left">
                            <label className="text-[9px] text-slate-400 uppercase tracking-wide">Image Asset URL (Auto-filled on upload)</label>
                            <input 
                              type="url" 
                              required
                              placeholder="https://res.cloudinary.com/..."
                              value={bookForm.imageUrl}
                              onChange={e => setBookForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                              className="admin-form-input text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sticky Footer Buttons */}
                <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/80 backdrop-blur-sm">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setIsBookModalOpen(false)}
                    className="rounded-xl h-10 font-bold border-slate-200 hover:bg-slate-50 text-slate-700"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={uploadingImage}
                    className="rounded-xl h-10 font-bold bg-[#388e3c] hover:bg-[#2e7d32] text-white px-6 shadow-md shadow-emerald-700/10"
                  >
                    {selectedBook ? "Save Changes" : "Create Publication"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
export default AdminDashboard;
