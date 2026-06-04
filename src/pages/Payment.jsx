import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { apiFetch } from '@/services/api.js';
import { 
  CreditCard, Check, ShieldCheck, Clock, MapPin, 
  User, Mail, Phone, BookOpen, AlertTriangle, ArrowRight, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import './Payment.css';

export function Payment({ cart, clearCart }) {
  const { orderId } = useParams();
  const navigate = useNavigate();

  // Order state from backend
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  // Form states
  const [paymentMethod, setPaymentMethod] = useState('card'); // card, upi, netbanking, cod
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [selectedBank, setSelectedBank] = useState('');

  // Fetch the created order from MongoDB on mount
  useEffect(() => {
    async function fetchOrder() {
      try {
        const response = await apiFetch(`/api/orders/${orderId}`);
        if (response.ok) {
          const data = await response.json();
          setOrder(data);
          
          // Pre-fill card billing fields
          if (data.billingDetails) {
            setCardName(`${data.billingDetails.firstName} ${data.billingDetails.lastName || ''}`.trim());
          }
          if (data.status === 'processing' || data.status === 'completed' || data.status === 'paid') {
            setIsPaid(true);
          }
        } else {
          toast.error("Could not locate the billing invoice.");
        }
      } catch (err) {
        console.error("Error loading payment order invoice:", err);
        toast.error("Network error: Could not retrieve order billing records.");
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderId]);

  // Card input formatters
  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.slice(0, 16);
    const matches = value.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      setCardNumber(parts.join(' '));
    } else {
      setCardNumber(value);
    }
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.slice(0, 4);
    if (value.length >= 2) {
      setCardExpiry(`${value.slice(0, 2)}/${value.slice(2)}`);
    } else {
      setCardExpiry(value);
    }
  };

  // Process transaction
  const handleProcessPayment = async () => {
    // Form validations
    if (paymentMethod === 'card') {
      if (cardNumber.replace(/\s/g, '').length !== 16) {
        toast.error("Please enter a valid 16-digit card number.");
        return;
      }
      if (!cardExpiry.includes('/') || cardExpiry.length < 5) {
        toast.error("Please enter card expiry date (MM/YY).");
        return;
      }
      if (cardCvv.length < 3) {
        toast.error("Please enter card security code (CVV).");
        return;
      }
      if (!cardName.trim()) {
        toast.error("Please enter cardholder name.");
        return;
      }
    } else if (paymentMethod === 'upi') {
      if (!upiId.trim() || !upiId.includes('@')) {
        toast.error("Please enter a valid UPI ID (e.g. user@okhdfcbank).");
        return;
      }
    } else if (paymentMethod === 'netbanking') {
      if (!selectedBank) {
        toast.error("Please select your bank institution.");
        return;
      }
    }

    // Launch secure gateway simulation
    setIsProcessing(true);
    
    // Simulate premium authorization duration
    setTimeout(async () => {
      try {
        const simulatedPayId = `pay_sim_${Math.random().toString(36).substring(2, 12).toUpperCase()}`;
        const simulatedSignature = `sig_sim_${Math.random().toString(36).substring(2, 24)}`;
        
        // PUT update to MongoDB order status
        const response = await apiFetch(`/api/orders/${orderId}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'processing',
            trackingId: simulatedPayId,
            razorpayPaymentId: simulatedPayId,
            razorpayOrderId: order.razorpayOrderId || `order_sim_${orderId.slice(-6)}`,
            razorpaySignature: simulatedSignature,
            note: `Payment processed successfully via IFT Payment Gateway (Simulated). Payment Method: ${paymentMethod.toUpperCase()}`
          })
        });

        if (response.ok) {
          const updated = await response.json();
          setOrder(updated);
          setIsPaid(true);
          clearCart(); // Clear frontend shopping cart
          toast.success("Transaction approved successfully!");
        } else {
          throw new Error("Could not log transaction approvals on the backend.");
        }
      } catch (err) {
        console.error("Payment sync failed:", err);
        toast.error("Failed to record simulated payment. Please try again.");
      } finally {
        setIsProcessing(false);
      }
    }, 1800);
  };

  if (loading) {
    return (
      <div className="payment-loading">
        <Loader2 className="h-10 w-10 text-[#388e3c] animate-spin mb-4" />
        <p>Retrieving your secure billing invoice...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="payment-not-found">
        <AlertTriangle className="h-12 w-12 text-rose-500 mb-4" />
        <h2>Invoice Not Found</h2>
        <p>We could not retrieve any billing records corresponding to order #{orderId}.</p>
        <Link to="/">
          <button className="payment-pay-btn" style={{ maxWidth: '200px', marginTop: 0 }}>Return to Books</button>
        </Link>
      </div>
    );
  }

  // BREADCRUMBS
  const breadcrumbs = (
    <div className="payment-breadcrumbs">
      <Link to="/">Home</Link>
      <span>&gt;</span>
      <Link to="/checkout">Checkout</Link>
      <span>&gt;</span>
      <span className="active">Secure Payment</span>
    </div>
  );

  // VIEW 1: Payment successful receipt page
  if (isPaid) {
    return (
      <div className="payment-page">
        <div className="payment-container receipt-view">
          {breadcrumbs}

          <div className="payment-receipt-card">
            <div className="top-stripe"></div>
            
            {/* Confirmed Icon Header */}
            <div className="payment-receipt-header">
              <div className="payment-receipt-icon-wrapper">
                <Check className="h-9 w-9 stroke-[3]" />
              </div>
              <h1>Order Confirmed!</h1>
              <p>Thank you! Your payment has been approved and registered successfully.</p>
              <span className="payment-receipt-badge">
                Paid & Processing
              </span>
            </div>

            <div className="payment-receipt-content">
              {/* Order Quick Metadata */}
              <div className="payment-receipt-meta">
                <div>
                  <span className="label">Order ID</span>
                  <span className="val mono">#{order.id?.slice(-6).toUpperCase() || order._id?.slice(-6).toUpperCase() || order.id}</span>
                </div>
                <div>
                  <span className="label">Date</span>
                  <span className="val">{new Date(order.createdAt).toLocaleDateString('en-GB')}</span>
                </div>
                <div>
                  <span className="label">Total Paid</span>
                  <span className="val price">₹{Number(order.total).toFixed(2)}</span>
                </div>
                <div>
                  <span className="label">Payment</span>
                  <span className="val payment-method">{order.paymentMethod || 'Online'}</span>
                </div>
              </div>

              {/* Progress Timeline Tracker */}
              <div className="payment-receipt-timeline-section">
                <h3>Checkout Progress</h3>
                
                <div className="payment-receipt-timeline-container">
                  <div className="payment-receipt-timeline-bg"></div>
                  <div className="payment-receipt-timeline-progress"></div>
                  
                  <div className="payment-receipt-timeline-node completed">
                    <div className="payment-receipt-timeline-circle"><Check size={12} className="stroke-[3]" /></div>
                    <span className="node-label">Placed</span>
                  </div>
                  <div className="payment-receipt-timeline-node completed">
                    <div className="payment-receipt-timeline-circle"><Check size={12} className="stroke-[3]" /></div>
                    <span className="node-label">Paid</span>
                  </div>
                  <div className="payment-receipt-timeline-node">
                    <div className="payment-receipt-timeline-circle"><Clock size={11} /></div>
                    <span className="node-label">Shipped</span>
                  </div>
                  <div className="payment-receipt-timeline-node">
                    <div className="payment-receipt-timeline-circle"><Clock size={11} /></div>
                    <span className="node-label">Completed</span>
                  </div>
                </div>
              </div>

              {/* Delivery / Shipping details summary */}
              <div className="payment-receipt-address">
                <h4><MapPin className="h-4 w-4 text-[#388e3c]" /> Dispatch address details</h4>
                <div className="payment-receipt-address-details">
                  <p className="name">
                    {order.shippingDetails?.firstName || order.billingDetails?.firstName} {order.shippingDetails?.lastName || order.billingDetails?.lastName}
                  </p>
                  <p className="street">
                    {order.shippingDetails?.streetAddress1 || order.billingDetails?.streetAddress1}<br />
                    {(order.shippingDetails?.streetAddress2 || order.billingDetails?.streetAddress2) && <>{order.shippingDetails?.streetAddress2 || order.billingDetails?.streetAddress2}<br /></>}
                    {order.shippingDetails?.city || order.billingDetails?.city}, {order.shippingDetails?.state || order.billingDetails?.state} - {order.shippingDetails?.pinCode || order.billingDetails?.pinCode}
                  </p>
                  <p className="phone"><Phone size={11} /> {order.billingDetails?.phone}</p>
                </div>
              </div>

              {/* Interactive buttons */}
              <div className="payment-receipt-actions">
                <Link to="/profile">
                  <button className="btn-orders">
                    Go to My Orders
                  </button>
                </Link>
                <Link to="/">
                  <button className="btn-home">
                    Continue Shopping
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // VIEW 2: Standard payment gateway inputs page
  const subtotal = order.total > 500 ? order.total : order.total - 30;
  const shippingCharge = order.total > 500 ? 0 : 30;

  return (
    <div className="payment-page">
      <div className="payment-container">
        {breadcrumbs}

        <div className="payment-header">
          <div className="payment-header-icon">
            <ShieldCheck className="h-6 w-6 stroke-[2.5]" />
          </div>
          <h1>Secure Payment Gateway</h1>
          <p>Islamic Foundation Trust Secure Payments Node — Chennai</p>
        </div>

        <div className="payment-grid">
          
          {/* Left 7 Columns: Selection of payment options */}
          <div className="payment-card-panel">
            
            <h3>Select payment channel</h3>
            
            {/* Accordion Tabs */}
            <div className="payment-channels-list">
              
              {/* Option 1: Cards */}
              <div 
                onClick={() => setPaymentMethod('card')}
                className={`payment-channel-item ${paymentMethod === 'card' ? 'active' : ''}`}
              >
                <div className="payment-channel-header">
                  <label className="payment-channel-label">
                    <input 
                      type="radio" 
                      name="pay_channel" 
                      checked={paymentMethod === 'card'} 
                      onChange={() => setPaymentMethod('card')}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Credit / Debit Card</span>
                  </label>
                  <CreditCard className="h-4 w-4 text-slate-400" />
                </div>
                
                <AnimatePresence>
                  {paymentMethod === 'card' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="payment-channel-details"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="payment-input-group">
                        <label>Card Number *</label>
                        <input 
                          type="text" 
                          placeholder="4111 2222 3333 4444" 
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          className="payment-input card-num"
                        />
                      </div>
                      
                      <div className="payment-input-row">
                        <div className="payment-input-group">
                          <label>Expiry *</label>
                          <input 
                            type="text" 
                            placeholder="MM/YY" 
                            value={cardExpiry}
                            onChange={handleExpiryChange}
                            className="payment-input"
                          />
                        </div>
                        <div className="payment-input-group">
                          <label>CVV / Security Key *</label>
                          <input 
                            type="password" 
                            placeholder="123" 
                            maxLength={4}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                            className="payment-input"
                          />
                        </div>
                      </div>

                      <div className="payment-input-group">
                        <label>Cardholder Name *</label>
                        <input 
                          type="text" 
                          placeholder="Name printed on card" 
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          className="payment-input"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Option 2: UPI */}
              <div 
                onClick={() => setPaymentMethod('upi')}
                className={`payment-channel-item ${paymentMethod === 'upi' ? 'active' : ''}`}
              >
                <div className="payment-channel-header">
                  <label className="payment-channel-label">
                    <input 
                      type="radio" 
                      name="pay_channel" 
                      checked={paymentMethod === 'upi'} 
                      onChange={() => setPaymentMethod('upi')}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>UPI ID / Google Pay / PhonePe</span>
                  </label>
                  <span className="payment-channel-badge">Instant</span>
                </div>
                
                <AnimatePresence>
                  {paymentMethod === 'upi' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="payment-channel-details"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="payment-upi-qr-card">
                        <div className="payment-upi-qr-frame">
                          <div className="relative">
                            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=upi://pay?pa=iftchennai@okhdfcbank%26pn=IslamicFoundationTrust%26am=${order.total}%26cu=INR`} alt="Payment QR Code" />
                          </div>
                        </div>
                        <div className="payment-upi-qr-info">
                          <h4>Scan dynamically created QR code</h4>
                          <p>Open BHIM, GooglePay, PhonePe, or any UPI banking app, scan this QR code, and verify transaction amount.</p>
                          <p className="total">Total: ₹{Number(order.total).toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="payment-input-group">
                        <label>Or pay via UPI ID *</label>
                        <input 
                          type="text" 
                          placeholder="username@okhdfcbank" 
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          className="payment-input"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Option 3: Net Banking */}
              <div 
                onClick={() => setPaymentMethod('netbanking')}
                className={`payment-channel-item ${paymentMethod === 'netbanking' ? 'active' : ''}`}
              >
                <div className="payment-channel-header">
                  <label className="payment-channel-label">
                    <input 
                      type="radio" 
                      name="pay_channel" 
                      checked={paymentMethod === 'netbanking'} 
                      onChange={() => setPaymentMethod('netbanking')}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Net Banking</span>
                  </label>
                </div>
                
                <AnimatePresence>
                  {paymentMethod === 'netbanking' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="payment-channel-details"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <label className="text-[10px] font-bold uppercase text-slate-500">Select Banking Institution *</label>
                      <select 
                        value={selectedBank} 
                        onChange={(e) => setSelectedBank(e.target.value)}
                        className="payment-select"
                      >
                        <option value="">Choose bank...</option>
                        <option value="sbi">State Bank of India</option>
                        <option value="hdfc">HDFC Bank</option>
                        <option value="icici">ICICI Bank</option>
                        <option value="axis">Axis Bank</option>
                        <option value="kodak">Kotak Mahindra Bank</option>
                      </select>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Option 4: COD */}
              <div 
                onClick={() => setPaymentMethod('cod')}
                className={`payment-channel-item ${paymentMethod === 'cod' ? 'active' : ''}`}
              >
                <div className="payment-channel-header">
                  <label className="payment-channel-label">
                    <input 
                      type="radio" 
                      name="pay_channel" 
                      checked={paymentMethod === 'cod'} 
                      onChange={() => setPaymentMethod('cod')}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Cash on Delivery (COD)</span>
                  </label>
                </div>
                
                <AnimatePresence>
                  {paymentMethod === 'cod' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="payment-channel-details"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <p className="text-xs text-slate-500 leading-relaxed font-semibold" style={{ margin: 0 }}>
                        Pay with cash upon package handover. Note that an additional handling fee or support verification call may apply to authenticate guest deliveries.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>

            <button
              onClick={handleProcessPayment}
              disabled={isProcessing}
              className="payment-pay-btn"
            >
              {isProcessing ? 'Verifying billing keys...' : `Pay ₹${Number(order.total).toFixed(2)}`}
            </button>
          </div>

          {/* Right 5 Columns: Invoice Summary */}
          <div className="payment-invoice-panel">
            <h3>Invoice details</h3>
            
            <div className="payment-invoice-rows">
              <div className="payment-invoice-row">
                <span className="label">Order Invoice</span>
                <span className="val mono">
                  #{order.id?.slice(-6).toUpperCase() || order._id?.slice(-6).toUpperCase() || order.id}
                </span>
              </div>
              
              <div className="payment-invoice-row">
                <span className="label">Date</span>
                <span className="val">
                  {new Date(order.createdAt).toLocaleDateString('en-GB')}
                </span>
              </div>

              <div className="payment-invoice-items-group">
                <span className="section-label">Publications list</span>
                {order.items && order.items.map((item, idx) => (
                  <div key={idx} className="payment-invoice-item">
                    <span className="item-name">{item.product?.name} <strong>x {item.quantity}</strong></span>
                    <span className="item-price">₹{Number((item.product?.price || 0) * item.quantity).toFixed(0)}</span>
                  </div>
                ))}
              </div>

              <div className="payment-invoice-row subtotal">
                <span className="label">Subtotal</span>
                <span className="val">₹{Number(subtotal).toFixed(2)}</span>
              </div>

              <div className="payment-invoice-row shipping">
                <span className="label">Shipping charges</span>
                <span className="val">
                  {shippingCharge === 0 ? 'Free' : `₹${shippingCharge.toFixed(2)}`}
                </span>
              </div>

              <div className="payment-invoice-row total">
                <span className="label">Total Payable</span>
                <span className="val">₹{Number(order.total).toFixed(2)}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Support Box */}
        <div className="payment-secure-badge">
          <h4><ShieldCheck size={14} /> 256-bit Secure Gateway</h4>
          <p>Your personal details are encrypted with TLS 1.3 standards. Direct card entries do not touch IFT local servers.</p>
        </div>
      </div>

      {/* SECURE PAYMENT SIMULATION OVERLAY MODAL */}
      {isProcessing && (
        <div className="payment-processing-overlay">
          <div className="payment-processing-modal">
            <div className="top-bar"></div>
            <Loader2 className="h-10 w-10 text-[#388e3c] animate-spin mx-auto mb-4" />
            <h3>Securing Transaction</h3>
            <p>Authorizing payment details with end-to-end 256-bit encryption. Please do not close or refresh this page...</p>
          </div>
        </div>
      )}

    </div>
  );
}
export default Payment;
