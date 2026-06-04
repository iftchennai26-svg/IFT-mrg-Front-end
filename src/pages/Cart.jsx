import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { X, Plus, Minus, ShoppingBag, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import './Cart.css';

/**
 * Cart component for the premium storefront.
 * Handles item updates, coupon discounts, shipping calculations, and checkout initialization.
 */
export function Cart({ cart, removeFromCart, updateQuantity, clearCart }) {
  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [showCoupon, setShowCoupon] = useState(false);

  // Address editing state (For "Change address" in Cart)
  const [showChangeAddress, setShowChangeAddress] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    street1: '138, IFT Lane',
    street2: 'Perambur High Road',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600012',
  });

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const shipping = subtotal > 500 ? 0 : 30; // ₹30 shipping charges
  const total = subtotal + shipping - discount;

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (code === 'IFT10' || code === 'WELCOME10') {
      const discAmt = subtotal * 0.1; // 10% off
      setDiscount(discAmt);
      setAppliedCoupon(code);
      toast.success(`Coupon "${code}" applied successfully! 10% discount subtracted.`);
    } else {
      toast.error('Invalid coupon code. Try WELCOME10 or IFT10.');
    }
  };

  const handleUpdateCartNotification = () => {
    toast.success("Cart Updated");
  };

  if (cart.length === 0) {
    return (
      <div className="cart-empty">
        <div className="cart-empty-content">
          <div className="cart-empty-icon">
            <ShoppingBag className="h-10 w-10" />
          </div>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added any Islamic moral stories or translations yet.</p>
          <Link to="/" className="inline-block mt-4">
            <Button className="bg-[#388e3c] hover:bg-[#2e7d32] text-white px-8 h-12 rounded-xl font-bold">
              Explore Bookstore
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container mx-auto px-4 max-w-7xl">
        <h1 className="cart-title">
          Your Cart: {cart.reduce((sum, item) => sum + item.quantity, 0)} item{cart.length > 1 ? 's' : ''}
        </h1>

        <div className="cart-grid">
          
          {/* LEFT: Products Table */}
          <div className="cart-main-col">
            <div className="cart-table-wrapper">
              <div className="overflow-x-auto">
                <table className="cart-table">
                  <thead>
                    <tr>
                      <th className="py-4 px-6">Product</th>
                      <th className="py-4 px-4 text-center">Price</th>
                      <th className="py-4 px-4 text-center">Quantity</th>
                      <th className="py-4 px-4 text-right">Subtotal</th>
                      <th className="py-4 px-6 text-center">Remove</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item) => (
                      <tr key={item.productId}>
                        {/* Product Detail Cell */}
                        <td className="py-5 px-6 flex items-center gap-4">
                          <div className="cart-product-img-wrapper">
                            <img 
                              src={item.product.imageUrl} 
                              alt={item.product.name} 
                              className="cart-product-img"
                            />
                          </div>
                          <div className="cart-product-info">
                            <span className="cart-product-name">
                              {item.product.name}
                            </span>
                            {item.product.author && (
                              <span className="cart-product-author">
                                by {item.product.author}
                              </span>
                            )}
                            <div className="cart-product-badges">
                              <span className="inline-flex items-center rounded-full bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400 border border-amber-200/40 shadow-sm">
                                🔥 Purchased {(((item.product.reviewCount || 12) * 17 + 85) % 350) + 120}+ times
                              </span>
                              <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-950/20 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:text-blue-400 border border-blue-200/40 shadow-sm">
                                📅 Published: {item.product.price > 350 ? '2024' : item.product.price > 180 ? '2023' : '2025'}
                              </span>
                            </div>
                          </div>
                        </td>
                        
                        {/* Price Cell */}
                        <td className="cart-price-cell">
                          ₹{item.product.price}
                        </td>
                        
                        {/* Quantity Cell */}
                        <td className="py-5 px-4">
                          <div className="cart-quantity-selector">
                            <button 
                              onClick={() => updateQuantity(item.productId, -1)} 
                              className="cart-quantity-btn"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <input 
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (!isNaN(val) && val >= 1) {
                                  updateQuantity(item.productId, val - item.quantity);
                                }
                              }}
                              className="cart-quantity-input"
                            />
                            <button 
                              onClick={() => updateQuantity(item.productId, 1)} 
                              className="cart-quantity-btn"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                        
                        {/* Subtotal Cell */}
                        <td className="cart-subtotal-cell">
                          ₹{(item.product.price * item.quantity).toFixed(2)}
                        </td>
                        
                        {/* Remove Cell */}
                        <td className="py-5 px-6 text-center">
                          <button 
                            onClick={() => {
                              removeFromCart(item.productId);
                              toast.info("Removed book from cart");
                            }}
                            className="cart-remove-btn"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Update Cart Button */}
            <div className="cart-actions">
              <button 
                onClick={handleUpdateCartNotification}
                className="cart-update-btn"
              >
                Update cart
              </button>
            </div>
          </div>

          {/* RIGHT: Cart Totals Sidebar */}
          <div className="cart-sidebar">
            <h2>Cart Totals</h2>
            
            <div className="cart-sidebar-totals">
              <div className="cart-totals-row">
                <span className="label">Subtotal</span>
                <span className="value">₹{subtotal.toFixed(2)}</span>
              </div>
              
              <Separator />

              {/* Shipping section */}
              <div className="space-y-3">
                <div className="cart-totals-row">
                  <span className="label">Shipping</span>
                  <span className="value">₹{shipping}</span>
                </div>
                
                <div className="cart-shipping-box">
                  <div className="cart-shipping-title">
                    <Truck className="h-4 w-4" /> Shipping Charges: ₹{shipping}
                  </div>
                  <p className="cart-shipping-desc">
                    Shipping to <strong>{shippingAddress.street1}, {shippingAddress.street2}, {shippingAddress.city} {shippingAddress.pincode}, {shippingAddress.state}.</strong>
                  </p>
                  
                  <button 
                    onClick={() => setShowChangeAddress(!showChangeAddress)}
                    className="cart-change-address-btn"
                  >
                    Change address
                  </button>

                  {showChangeAddress && (
                    <div className="cart-address-form">
                      <Input
                        placeholder="Flat No / Door No"
                        value={shippingAddress.street1}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, street1: e.target.value })}
                        className="rounded-lg h-9 text-xs"
                      />
                      <Input
                        placeholder="Street address"
                        value={shippingAddress.street2}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, street2: e.target.value })}
                        className="rounded-lg h-9 text-xs"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="City"
                          value={shippingAddress.city}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                          className="rounded-lg h-9 text-xs"
                        />
                        <Input
                          placeholder="Pincode"
                          value={shippingAddress.pincode}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, pincode: e.target.value })}
                          className="rounded-lg h-9 text-xs"
                        />
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => {
                          setShowChangeAddress(false);
                          toast.success("Delivery address updated!");
                        }}
                        className="w-full bg-[#388e3c] text-white hover:bg-[#2e7d32]"
                      >
                        Update Address
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Coupon Accordion */}
              <div className="cart-coupon-accordion">
                <button 
                  onClick={() => setShowCoupon(!showCoupon)}
                  className="cart-coupon-trigger"
                >
                  <span>Coupon</span>
                  <span>{showCoupon ? '-' : '+'}</span>
                </button>
                
                {showCoupon && (
                  <div className="cart-coupon-input-group">
                    <div className="cart-coupon-input-row">
                      <Input
                        placeholder="Coupon Code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="rounded-lg h-10"
                      />
                      <Button 
                        onClick={handleApplyCoupon}
                        className="bg-[#388e3c] text-white hover:bg-[#2e7d32] rounded-lg shrink-0 px-4 h-10 font-bold"
                      >
                        Apply Coupon
                      </Button>
                    </div>

                    <div className="cart-offers-list">
                      <p className="cart-offers-title">Available Offers</p>
                      
                      <div 
                        onClick={() => {
                          setCouponCode('WELCOME10');
                          const discAmt = subtotal * 0.1;
                          setDiscount(discAmt);
                          setAppliedCoupon('WELCOME10');
                          toast.success('Coupon "WELCOME10" applied successfully! 10% discount subtracted.');
                        }}
                        className="cart-offer-card"
                      >
                        <div>
                          <span className="cart-offer-badge">WELCOME10</span>
                          <span className="cart-offer-name">10% Off First Order</span>
                          <p className="cart-offer-desc">Get 10% discount on moral story books.</p>
                        </div>
                        <span className="cart-offer-apply">Apply</span>
                      </div>

                      <div 
                        onClick={() => {
                          setCouponCode('IFT10');
                          const discAmt = subtotal * 0.1;
                          setDiscount(discAmt);
                          setAppliedCoupon('IFT10');
                          toast.success('Coupon "IFT10" applied successfully! 10% discount subtracted.');
                        }}
                        className="cart-offer-card"
                      >
                        <div>
                          <span className="cart-offer-badge">IFT10</span>
                          <span className="cart-offer-name">IFT Publisher Discount</span>
                          <p className="cart-offer-desc">Special trust 10% discount on Quran & translations.</p>
                        </div>
                        <span className="cart-offer-apply">Apply</span>
                      </div>
                    </div>
                  </div>
                )}
                {appliedCoupon && (
                  <p className="cart-coupon-status">
                    ✓ Coupon "{appliedCoupon}" active (-10%)
                  </p>
                )}
              </div>

              <Separator />

              {/* Grand Total */}
              <div className="cart-total-row">
                <span>Total</span>
                <span className="cart-total-value">₹{total.toFixed(2)}</span>
              </div>

              {/* Proceed Button */}
              <Link 
                to="/checkout"
                className="cart-checkout-btn"
              >
                Proceed to checkout
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
export default Cart;
