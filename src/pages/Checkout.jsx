import React, { useState } from 'react';
import { useAuth } from '@/context/AuthProvider.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard, Check, HelpCircle } from 'lucide-react';
import { apiFetch } from '@/services/api.js';
import './Checkout.css';

export function Checkout({ cart, clearCart }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [showCouponInput, setShowCouponInput] = useState(false);

  // Returning Customer Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleReturningLogin = (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error("Please enter both username/email and password.");
      return;
    }
    toast.success(`Successfully signed in as ${loginEmail}!`);
  };

  // Billing Details state (Prefilled as per screenshots)
  const [billing, setBilling] = useState({
    firstName: 'MOHAMMED',
    lastName: 'SULAIMAN M S',
    companyName: '',
    country: 'India',
    streetAddress1: '367/2E ISTHIMA NAGAR',
    streetAddress2: 'VEPPOOR VILLAGE',
    city: 'MELVISHARAM P O',
    state: 'Tamil Nadu',
    pinCode: '632509',
    phone: '9944360360',
    email: 'mdsulai76@gmail.com',
  });

  // Shipping Details state (For "Ship to a different address?")
  const [shipToDifferent, setShipToDifferent] = useState(false);
  const [shipping, setShipping] = useState({
    firstName: 'Dhivan',
    lastName: 'Mydeen',
    country: 'India',
    streetAddress1: '9/137,North puthumanai street',
    streetAddress2: 'near masjid ur jumma masjid',
    city: 'Pottal Pudur, Tenkasi',
    state: 'Tamil Nadu',
    pinCode: '627423',
    orderNotes: 'Please send it immediately.',
  });

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Totals calculations
  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const shippingCharge = subtotal > 500 ? 0 : 30;
  const currentTotal = subtotal + shippingCharge - discount;

  // Coupon Handler
  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (code === 'IFT10' || code === 'WELCOME10') {
      const discAmt = subtotal * 0.1;
      setDiscount(discAmt);
      setAppliedCoupon(code);
      toast.success(`Coupon "${code}" applied successfully! 10% discount applied.`);
    } else {
      toast.error('Invalid coupon code. Try WELCOME10 or IFT10.');
    }
  };

  // Pending Order states for the Payment Page transition
  const [pendingOrder, setPendingOrder] = useState(null);
  const [generalNotes, setGeneralNotes] = useState('Please send it immediately.');

  const handlePlaceOrder = async () => {
    const activeUserId = user?.uid || 'guest-user-123';

    if (!termsAccepted) {
      toast.error("Please read and accept the website terms and conditions to proceed.");
      return;
    }

    const addr = shipToDifferent ? shipping : billing;
    if (!addr.firstName || !addr.lastName || !addr.streetAddress1 || !addr.city || !addr.state || !addr.pinCode) {
      toast.error("Please fill in all required address fields.");
      return;
    }

    const shippingAddressStr = shipToDifferent
      ? `${shipping.firstName} ${shipping.lastName}, ${shipping.streetAddress1}, ${shipping.streetAddress2 ? shipping.streetAddress2 + ', ' : ''}${shipping.city}, ${shipping.state} - ${shipping.pinCode}`
      : `${billing.firstName} ${billing.lastName}, ${billing.streetAddress1}, ${billing.streetAddress2 ? billing.streetAddress2 + ', ' : ''}${billing.city}, ${billing.state} - ${billing.pinCode}`;

    setIsProcessing(true);
    try {
      // 1. Create pending order on backend API with detailed billing and shipping
      const response = await apiFetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: activeUserId,
          items: cart,
          total: currentTotal,
          status: 'pending',
          shippingAddress: shippingAddressStr,
          billingDetails: billing,
          shippingDetails: shipToDifferent ? shipping : { ...billing, orderNotes: generalNotes },
          orderNotes: shipToDifferent ? shipping.orderNotes : generalNotes,
          paymentMethod: 'Online'
        })
      });
      if (!response.ok) {
        throw new Error("Failed to register pending order.");
      }
      const orderData = await response.json();
      const orderId = orderData._id || orderData.id;
      toast.success("Order registered successfully! Redirecting to secure payment page...");
      navigate(`/payment/${orderId}`);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to initialize order registration.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-breadcrumbs">
          <Link to="/">Home</Link>
          <span>&gt;</span>
          <span className="active">Checkout</span>
        </div>

        <h1 className="checkout-title">Checkout</h1>

        {/* Returning Customer Sign In Panel */}
        <div className="checkout-login-panel">
          <p>
            If you have shopped with us before, please enter your details below. If you are a new customer, please proceed to the Billing section.
          </p>

          <form onSubmit={handleReturningLogin} className="checkout-form">
            <div className="checkout-form-group">
              <label>Username or email *</label>
              <Input
                type="text"
                placeholder="Username or email *"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="rounded-lg h-11 border-slate-200 dark:border-slate-800 w-full"
              />
            </div>

            <div className="checkout-form-group">
              <label>Password *</label>
              <Input
                type="password"
                placeholder="Password *"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="rounded-lg h-11 border-slate-200 dark:border-slate-800 w-full"
              />
            </div>

            <div className="checkout-login-footer">
              <label>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Remember me</span>
              </label>
              <a href="#forgot" className="checkout-forgot-link">
                Forgot Password?
              </a>
            </div>

            <div className="grid grid-cols-1 gap-3 pt-3">
              <button
                type="submit"
                className="checkout-login-btn"
              >
                Sign In
              </button>
            </div>
          </form>
        </div>

        {/* Top Coupon Banner */}
        <div className="checkout-coupon-banner">
          <span>Have a coupon? </span>
          <button 
            onClick={() => setShowCouponInput(!showCouponInput)}
            className="checkout-coupon-toggle"
          >
            Click here to enter your code
          </button>

          {showCouponInput && (
            <div className="checkout-coupon-input-group animate-in slide-in-from-top-2">
              <p>If you have a coupon code, please apply it below.</p>
              <div className="checkout-coupon-row">
                <Input
                  placeholder="Coupon Code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="rounded-lg h-10 border-slate-200 dark:border-slate-800"
                />
                <button 
                  onClick={handleApplyCoupon}
                  className="checkout-coupon-apply-btn"
                >
                  Apply Coupon
                </button>
              </div>
            </div>
          )}
          {appliedCoupon && (
            <p className="checkout-coupon-active">
              <Check className="h-4 w-4" /> Coupon "{appliedCoupon}" active!
            </p>
          )}
        </div>

        <div className="checkout-grid">
          
          {/* LEFT: Billing Details */}
          <div className="checkout-main-col">
            <h2>Billing details</h2>
            
            <div className="checkout-form">
              <div className="checkout-input-row">
                <div className="checkout-input-group">
                  <label>First name *</label>
                  <Input 
                    value={billing.firstName}
                    onChange={(e) => setBilling({ ...billing, firstName: e.target.value })}
                    className="rounded-lg border-slate-200 dark:border-slate-800 h-11"
                  />
                </div>
                <div className="checkout-input-group">
                  <label>Last name *</label>
                  <Input 
                    value={billing.lastName}
                    onChange={(e) => setBilling({ ...billing, lastName: e.target.value })}
                    className="rounded-lg border-slate-200 dark:border-slate-800 h-11"
                  />
                </div>
              </div>

              <div className="checkout-input-group">
                <label>Company name (optional)</label>
                <Input 
                  value={billing.companyName}
                  onChange={(e) => setBilling({ ...billing, companyName: e.target.value })}
                  className="rounded-lg border-slate-200 dark:border-slate-800 h-11"
                />
              </div>

              <div className="checkout-input-group">
                <label>Country / Region *</label>
                <select 
                  value={billing.country}
                  onChange={(e) => setBilling({ ...billing, country: e.target.value })}
                  className="checkout-select"
                >
                  <option value="India">India</option>
                  <option value="Sri Lanka">Sri Lanka</option>
                  <option value="Malaysia">Malaysia</option>
                  <option value="Singapore">Singapore</option>
                </select>
              </div>

              <div className="checkout-input-group">
                <label>Street address *</label>
                <Input 
                  value={billing.streetAddress1}
                  placeholder="House number and street name"
                  onChange={(e) => setBilling({ ...billing, streetAddress1: e.target.value })}
                  className="rounded-lg border-slate-200 dark:border-slate-800 h-11 mb-2"
                />
                <Input 
                  value={billing.streetAddress2}
                  placeholder="Apartment, suite, unit, etc. (optional)"
                  onChange={(e) => setBilling({ ...billing, streetAddress2: e.target.value })}
                  className="rounded-lg border-slate-200 dark:border-slate-800 h-11"
                />
              </div>

              <div className="checkout-input-group">
                <label>Town / City *</label>
                <Input 
                  value={billing.city}
                  onChange={(e) => setBilling({ ...billing, city: e.target.value })}
                  className="rounded-lg border-slate-200 dark:border-slate-800 h-11"
                />
              </div>

              <div className="checkout-input-group">
                <label>State *</label>
                <select 
                  value={billing.state}
                  onChange={(e) => setBilling({ ...billing, state: e.target.value })}
                  className="checkout-select"
                >
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Delhi">Delhi</option>
                </select>
              </div>

              <div className="checkout-input-group">
                <label>PIN Code *</label>
                <Input 
                  value={billing.pinCode}
                  onChange={(e) => setBilling({ ...billing, pinCode: e.target.value })}
                  className="rounded-lg border-slate-200 dark:border-slate-800 h-11"
                />
              </div>

              <div className="checkout-input-group">
                <label>Phone *</label>
                <Input 
                  value={billing.phone}
                  onChange={(e) => setBilling({ ...billing, phone: e.target.value })}
                  className="rounded-lg border-slate-200 dark:border-slate-800 h-11"
                />
              </div>

              <div className="checkout-input-group">
                <label>Email address *</label>
                <Input 
                  value={billing.email}
                  onChange={(e) => setBilling({ ...billing, email: e.target.value })}
                  className="rounded-lg border-slate-200 dark:border-slate-800 h-11"
                />
              </div>

              {/* Order Notes */}
              <div className="checkout-input-group">
                <label>Order notes (optional)</label>
                <textarea 
                  value={generalNotes}
                  onChange={(e) => setGeneralNotes(e.target.value)}
                  placeholder="Notes about your order, e.g. special notes for delivery."
                  rows={4}
                  className="checkout-textarea"
                />
              </div>

              {/* Ship to a different address toggle */}
              <div className="checkout-ship-toggle">
                <label>
                  <input
                    type="checkbox"
                    checked={shipToDifferent}
                    onChange={(e) => setShipToDifferent(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Ship to a different address?</span>
                </label>
              </div>

              {shipToDifferent && (
                <div className="checkout-different-address animate-in slide-in-from-top-4">
                  <div className="checkout-input-row">
                    <div className="checkout-input-group">
                      <label>First name *</label>
                      <Input 
                        value={shipping.firstName}
                        onChange={(e) => setShipping({ ...shipping, firstName: e.target.value })}
                        className="rounded-lg border-slate-200 dark:border-slate-800 h-11"
                      />
                    </div>
                    <div className="checkout-input-group">
                      <label>Last name *</label>
                      <Input 
                        value={shipping.lastName}
                        onChange={(e) => setShipping({ ...shipping, lastName: e.target.value })}
                        className="rounded-lg border-slate-200 dark:border-slate-800 h-11"
                      />
                    </div>
                  </div>

                  <div className="checkout-input-group">
                    <label>Country / Region *</label>
                    <select 
                      value={shipping.country}
                      onChange={(e) => setShipping({ ...shipping, country: e.target.value })}
                      className="checkout-select"
                    >
                      <option value="India">India</option>
                      <option value="Sri Lanka">Sri Lanka</option>
                      <option value="Malaysia">Malaysia</option>
                      <option value="Singapore">Singapore</option>
                    </select>
                  </div>

                  <div className="checkout-input-group">
                    <label>Street address *</label>
                    <Input 
                      value={shipping.streetAddress1}
                      placeholder="House number and street name"
                      onChange={(e) => setShipping({ ...shipping, streetAddress1: e.target.value })}
                      className="rounded-lg border-slate-200 dark:border-slate-800 h-11"
                    />
                    <Input 
                      value={shipping.streetAddress2}
                      placeholder="Apartment, suite, unit, etc. (optional)"
                      onChange={(e) => setShipping({ ...shipping, streetAddress2: e.target.value })}
                      className="rounded-lg border-slate-200 dark:border-slate-800 h-11"
                    />
                  </div>

                  <div className="checkout-input-group">
                    <label>Town / City *</label>
                    <Input 
                      value={shipping.city}
                      onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                      className="rounded-lg border-slate-200 dark:border-slate-800 h-11"
                    />
                  </div>

                  <div className="checkout-input-group">
                    <label>State *</label>
                    <select 
                      value={shipping.state}
                      onChange={(e) => setShipping({ ...shipping, state: e.target.value })}
                      className="checkout-select"
                    >
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Kerala">Kerala</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Delhi">Delhi</option>
                    </select>
                  </div>

                  <div className="checkout-input-group">
                    <label>PIN Code *</label>
                    <Input 
                      value={shipping.pinCode}
                      onChange={(e) => setShipping({ ...shipping, pinCode: e.target.value })}
                      className="rounded-lg border-slate-200 dark:border-slate-800 h-11"
                    />
                  </div>

                  <div className="checkout-input-group">
                    <label>Order notes (optional)</label>
                    <textarea 
                      value={shipping.orderNotes}
                      placeholder="Notes about your order, e.g. special notes for delivery."
                      onChange={(e) => setShipping({ ...shipping, orderNotes: e.target.value })}
                      rows={3}
                      className="checkout-textarea"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Order Summary & Payments */}
          <div className="checkout-side-col">
            <div className="checkout-order-summary">
              <h2>Your Order</h2>
              
              <div className="checkout-summary-list">
                {cart.map((item) => (
                  <div key={item.productId} className="checkout-summary-row">
                    <span className="name">
                      {item.product.name} <strong className="text-[#388e3c] font-bold">x {item.quantity}</strong>
                    </span>
                    <span className="val">₹{(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}

                <Separator className="my-4" />

                <div className="checkout-summary-subtotal">
                  <span>Subtotal</span>
                  <span className="val">₹{subtotal.toFixed(2)}</span>
                </div>

                <div className="checkout-summary-shipping">
                  <span>Shipping</span>
                  <span className="val">
                    {shippingCharge === 0 ? 'Free' : `Shipping Charges: ₹${shippingCharge}`}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="checkout-summary-discount">
                    <span>Discount (10%)</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}

                <Separator className="my-4 border-slate-200 dark:border-slate-800" />

                <div className="checkout-summary-total">
                  <span>Total</span>
                  <span className="val">₹{currentTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="checkout-payment-box">
              <h3>Payment</h3>
              
              <div className="checkout-payment-option">
                <div className="checkout-payment-option-row">
                  <label>
                    <input 
                      type="radio" 
                      name="payment_method" 
                      value="razorpay" 
                      defaultChecked 
                      className="w-4 h-4 border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Online</span>
                  </label>
                  <div className="checkout-payment-logo-badge">
                    <img src="https://razorpay.com/assets/razorpay-glyph.svg" alt="Razorpay Logo" className="h-4 w-auto" />
                    <span>Pay by Razorpay</span>
                  </div>
                </div>
                
                <p className="checkout-payment-desc">
                  Pay securely by Credit or Debit card or Internet Banking through Razorpay.
                </p>
              </div>

              <div className="checkout-privacy-notice">
                <p>
                  Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our <span className="link">privacy policy</span>.
                </p>
                
                <label>
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-[#388e3c] focus:ring-emerald-500 mt-0.5 shrink-0"
                  />
                  <span>
                    I have read and agree to the website <span className="link">terms and conditions</span> *
                  </span>
                </label>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className="checkout-place-order-btn"
              >
                {isProcessing ? 'Processing order...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
