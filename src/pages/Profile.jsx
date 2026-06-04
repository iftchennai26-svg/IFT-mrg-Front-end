import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthProvider.jsx';
import { auth } from '@/lib/firebase.js';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, LogOut, Package, Clock, Truck, CheckCircle, ChevronRight, BookOpen, Key, ArrowLeft, LayoutDashboard } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { apiFetch } from '@/services/api.js';
import './Profile.css';

export function Profile() {
  const navigate = useNavigate();
  const { user, loading, loginAsGuest, loginAsAdmin, logoutGuest } = useAuth();
  const [orders, setOrders] = useState([]);
  const [fetchingOrders, setFetchingOrders] = useState(false);

  // Admin login credentials fields
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  useEffect(() => {
    async function fetchOrders() {
      if (!user) return;
      setFetchingOrders(true);
      try {
        if (user.uid === 'guest-user-123' || user.uid === 'admin-user-456') {
          // Live orders list from backend even for admin and guest
          const response = await apiFetch(`/api/orders`);
          if (response.ok) {
            const data = await response.json();
            // Guests filter their orders locally, admin sees all
            if (user.uid === 'guest-user-123') {
              setOrders(data.filter(o => o.userId === user.uid));
            } else {
              setOrders(data);
            }
          }
        } else {
          const response = await apiFetch(`/api/orders?userId=${user.uid}`);
          if (response.ok) {
            const data = await response.json();
            setOrders(data);
          } else {
            throw new Error("Failed to load user orders");
          }
        }
      } catch (error) {
        console.error("Order fetch error:", error);
      } finally {
        setFetchingOrders(false);
      }
    }
    fetchOrders();
  }, [user]);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success("Logged in successfully");
    } catch (error) {
      console.error("Login Error:", error);
      toast.error(error.message || "Login failed due to an unknown error");
    }
  };

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    if (adminUsername.trim() === 'admin' && adminPassword.trim() === 'iftadmin') {
      loginAsAdmin();
      sessionStorage.setItem('admin_logged_in', 'true');
      toast.success("Welcome back, Administrator!");
      navigate('/admin');
    } else {
      toast.error("Access Denied: Invalid administrator credentials");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {}
    logoutGuest();
    toast.info("Logged out");
  };

  if (loading) return <div className="p-20 text-center">Loading...</div>;

  if (!user) {
    return (
      <div className="profile-login-container">
        <div className="profile-login-card">
          <div className="top-stripe"></div>
          <div className="profile-login-card-header">
            <BookOpen className="main-icon" />
            <h2>Welcome to IFT</h2>
            <p>Access your authentic publications and track order dispatches.</p>
          </div>
          
          <div className="profile-login-card-content">
            {!isAdminMode ? (
              <div className="profile-login-actions">
                <button className="btn-google" onClick={handleLogin}>
                  Login with Google
                </button>
                <button className="btn-guest" onClick={() => {
                  loginAsGuest();
                  toast.success("Logged in as Guest");
                }}>
                  Continue as Guest
                </button>
                
                <Separator className="my-6" />
                
                <button 
                  className="btn-admin-portal"
                  onClick={() => setIsAdminMode(true)}
                >
                  <Key className="h-4 w-4" /> Admin Login Portal
                </button>
              </div>
            ) : (
              <form onSubmit={handleAdminSubmit} className="profile-admin-form">
                <div className="profile-admin-form-header">
                  <button type="button" onClick={() => setIsAdminMode(false)}>
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <span>Administrative Login</span>
                </div>
                
                <div className="profile-admin-input-group">
                  <label>Admin Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter admin name"
                    value={adminUsername}
                    onChange={e => setAdminUsername(e.target.value)}
                  />
                </div>
                
                <div className="profile-admin-input-group">
                  <label>Admin Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter admin password"
                    value={adminPassword}
                    onChange={e => setAdminPassword(e.target.value)}
                  />
                </div>
                
                <button type="submit" className="profile-admin-submit-btn">
                  Secure Admin Login
                </button>
              </form>
            )}

            <p className="profile-login-copyright">
              © {new Date().getFullYear()} Islamic Foundation Trust. Chennai.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid': return <Badge className="bg-green-500/10 text-green-600 border-green-500/20 font-bold">Paid</Badge>;
      case 'shipped': return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 font-bold">Shipped</Badge>;
      case 'completed': return <Badge className="bg-green-500/10 text-green-700 border-green-500/20 font-bold">Completed</Badge>;
      case 'delivered': return <Badge className="bg-primary/10 text-primary border-primary/20 font-bold">Delivered</Badge>;
      case 'pending': return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 font-bold">Pending Payment</Badge>;
      case 'cancelled': return <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/20 font-bold">Cancelled</Badge>;
      default: return <Badge variant="secondary" className="font-bold">{status}</Badge>;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid': return <Clock className="h-5 w-5 text-green-600" />;
      case 'shipped': return <Truck className="h-5 w-5 text-blue-600" />;
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-700" />;
      case 'delivered': return <CheckCircle className="h-5 w-5 text-primary" />;
      default: return <Package className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-layout">
        {/* Sidebar */}
        <div className="profile-sidebar">
          <div className="profile-sidebar-card">
            <div className="profile-sidebar-header">
              <div className="profile-avatar-wrapper">
                <User />
              </div>
              <h2>{user.displayName || 'IFT Reader'}</h2>
              <p>{user.email}</p>
              {user.uid === 'admin-user-456' && (
                <span className="profile-admin-badge">Administrator</span>
              )}
            </div>
            <div className="profile-sidebar-menu">
              <Link to="/admin" style={{ textDecoration: 'none' }}>
                <button className="profile-menu-btn admin-link">
                  <LayoutDashboard className="h-4 w-4" /> Admin Control Panel
                </button>
              </Link>
              <button className="profile-menu-btn logout-btn" onClick={handleLogout}>
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          </div>

          <div className="profile-sidebar-info-box">
            <p className="title">Account Info</p>
            <div className="profile-sidebar-info-list">
              <div className="profile-sidebar-info-row">
                <span className="label">Member Since</span>
                <span className="val">{new Date(user.metadata.creationTime).toLocaleDateString()}</span>
              </div>
              <div className="profile-sidebar-info-row">
                <span className="label">Verified</span>
                <span className="val" style={{ color: '#16a34a' }}>Yes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="profile-main">
          <div className="profile-main-header">
            <h1>Your Orders</h1>
            <span className="profile-total-badge">{orders.length} Total</span>
          </div>

          <Separator />

          {fetchingOrders ? (
            <div className="profile-orders-list">
              {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-muted rounded-2xl animate-pulse" />)}
            </div>
          ) : orders.length === 0 ? (
            <div className="profile-empty-orders">
              <Package className="h-12 w-12 mx-auto mb-4" />
              <p>No orders placed yet.</p>
              <Link to="/">
                <button>Start Shopping</button>
              </Link>
            </div>
          ) : (
            <div className="profile-orders-list">
              {orders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="profile-order-card">
                    <div className="profile-order-header">
                      <div className="profile-order-info-group">
                        <div className="profile-order-icon-wrapper">
                          {getStatusIcon(order.status)}
                        </div>
                        <div className="profile-order-details">
                          <div className="profile-order-title-row">
                            <h3>Order #{((order.id || order._id || '').slice(-6).toUpperCase())}</h3>
                            {getStatusBadge(order.status)}
                          </div>
                          <p className="meta">
                            {order.items.length} items • ₹{order.total.toFixed(2)}
                          </p>
                          <p className="date">
                            Placed on {order.createdAt 
                              ? new Date(order.createdAt).toLocaleDateString('en-GB')
                              : 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="profile-order-actions">
                        {order.trackingId && (
                          <div className="profile-order-tx-info">
                            <span className="label">Transaction ID:</span>
                            <span className="val">{order.trackingId}</span>
                          </div>
                        )}
                        <button className="profile-order-track-btn">
                          Track Shipment <ChevronRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <div className="profile-order-thumbnails-strip">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="profile-order-thumb">
                          <img src={item.product?.imageUrl} alt={item.product?.name} className="h-full w-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
