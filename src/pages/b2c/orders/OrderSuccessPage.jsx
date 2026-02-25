import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle, Download, Truck, ShoppingBag, Phone, MapPin, CreditCard, Package, Banknote, ChevronRight } from "lucide-react";

import { useProducts } from "../../../hooks/useProducts";

import { jsPDF } from "jspdf";
import villyLogo from "../../../assets/b2c/landing/Landing-villy/VillyLogo11.png";

const OrderSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId, paymentMethod, items, shipping, total, email } = location.state || {};
  const { products, loading } = useProducts();

  // Calculate dynamic delivery date range
  const deliveryDateRange = React.useMemo(() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() + 5);
    const end = new Date(today);
    end.setDate(today.getDate() + 7);
    const fmt = (d) => d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${fmt(start)} - ${fmt(end)}`;
  }, []);

  // Get 4 random products for recommendations (stable per orderId)
  const recommendedProducts = React.useMemo(() => {
    if (!products || products.length === 0) return [];
    // Use orderId as seed for stable randomization
    const seed = (orderId || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const shuffled = [...products].sort((a, b) => {
      const ha = ((a.id || '').charCodeAt(0) + seed) % 100;
      const hb = ((b.id || '').charCodeAt(0) + seed) % 100;
      return ha - hb;
    });
    return shuffled.slice(0, 4);
  }, [products, orderId]);

  const handleDownloadInvoice = () => {
    const doc = new jsPDF();

    // Load Logo
    const img = new Image();
    img.src = villyLogo;
    img.onload = () => {
      // Add Logo
      const imgWidth = 40;
      const imgHeight = 20; // Aspect ratio adjustment might be needed
      doc.addImage(img, 'PNG', 20, 10, imgWidth, imgHeight);

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text("Invoice", 150, 25); // Moved Invoice text to right

      // Order Details
      doc.setFontSize(10);
      doc.text(`Order ID: ${orderId || 'N/A'}`, 20, 45);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 50);
      doc.text(`Payment Method: ${paymentMethod === "COD" ? "Cash on Delivery" : "Online"}`, 20, 55);

      // Shipping Address
      if (shipping) {
        doc.text("Shipping Address:", 120, 45);
        doc.text(shipping.fullName || "", 120, 50);
        doc.text(`${shipping.streetAddress || ""}`, 120, 55);
        doc.text(`${shipping.city || ""}, ${shipping.state || ""} ${shipping.postalCode || ""}`, 120, 60);
        doc.text(`Phone: ${shipping.phone || ""}`, 120, 65);
      }

      // Items
      let yPos = 80;
      doc.setDrawColor(200, 200, 200);
      doc.line(20, yPos - 5, 190, yPos - 5); // Header line

      doc.setFont(undefined, 'bold');
      doc.text("Item", 20, yPos);
      doc.text("Qty", 140, yPos);
      doc.text("Price", 160, yPos);
      doc.text("Total", 180, yPos);
      doc.setFont(undefined, 'normal');

      yPos += 10;

      items?.forEach(item => {
        const itemName = item.name.length > 50 ? item.name.substring(0, 50) + "..." : item.name;
        doc.text(itemName, 20, yPos);
        doc.text(String(item.quantity), 140, yPos);
        doc.text(`Rs.${item.price}`, 160, yPos);
        doc.text(`Rs.${item.price * item.quantity}`, 180, yPos);
        yPos += 10;
      });

      doc.line(20, yPos, 190, yPos); // Footer line
      yPos += 10;

      // Total
      doc.setFont(undefined, 'bold');
      doc.text(`Total Amount: Rs.${total?.toLocaleString() || 0}`, 150, yPos);

      doc.save(`Villy_Invoice_${orderId || 'Order'}.pdf`);
    };

    img.onerror = () => {
      // Fallback if image fails
      doc.setFontSize(22);
      doc.setTextColor(51, 2, 47);
      doc.text("Villy", 20, 20);
      doc.save(`Villy_Invoice_${orderId || 'Order'}.pdf`);
    }
  };

  if (!orderId) {
    // Fallback if accessed directly
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-gray-500 mb-4">No order details found.</p>
        <button onClick={() => navigate("/")} className="text-[#33022F] underline">Return Home</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-[Outfit] pb-12">

      {/* Progress Bar (Frozen at Confirmation) */}
      {/* Progress Bar (Frozen at Confirmation) */}
      <div className="w-full pt-8 pb-4 mb-8">
        <div className="max-w-6xl mx-auto px-4 h-24 flex items-center justify-center gap-2 md:gap-4 overflow-x-auto scrollbar-hide">
          {['Shipping', 'Payment', 'Review', 'Confirmation'].map((step, idx) => {
            // Confirmation is step 4, so idx 3. All previous are completed.
            const isCompleted = idx < 3;
            const isActive = idx === 3;

            return (
              <div key={step} className="flex flex-col items-center min-w-fit">
                <span className={`text-xs md:text-sm font-bold uppercase tracking-wider mb-2 transition-colors duration-300 ${isActive || isCompleted ? 'text-[#33022F]' : 'text-gray-300'}`}>
                  {step}
                </span>
                <div className={`w-16 md:w-32 h-2 rounded-full transition-all duration-300 ${isActive || isCompleted ? 'bg-[#33022F]' : 'bg-gray-200'}`}></div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4">

        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600">Thank you for your order. We've received your purchase and will send you a<br className="hidden md:block" /> confirmation email shortly.</p>
          <div className="mt-4 inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
            <span className="text-sm text-gray-500">Order ID:</span>
            <span className="text-sm font-bold text-gray-900">{orderId}</span>
          </div>
          <div className="mt-6 bg-blue-50 text-blue-700 px-4 py-2 rounded-md inline-block text-xs font-medium border border-blue-100">
            Confirmation email sent to {email || "your email"}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN - Order Details */}
          <div className="lg:col-span-2 space-y-6">

            {/* Order Summary Items */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ShoppingBag size={20} className="text-gray-400" /> Order Summary
              </h2>
              <div className="space-y-6">
                {items && items.map((item) => (
                  <div key={item.id} className="flex gap-4 border-b border-gray-50 last:border-0 pb-4 last:pb-0">
                    <div className="w-16 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h5 className="font-bold text-sm text-gray-900 mb-1">{item.brand?.toUpperCase() || 'BRAND'}</h5>
                      <p className="text-sm text-gray-700 font-medium mb-1">{item.name}</p>
                      <div className="text-xs text-gray-500">
                        Qty: {item.quantity} &bull; <span className="font-semibold text-gray-900">₹{item.price.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-gray-100 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold text-gray-900">₹{total ? (total / 1.18).toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-base font-bold pt-2">
                  <span className="text-gray-900">Total</span>
                  <span className="text-[#33022F]">₹{total?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Delivery & Payment Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Delivery Info */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Truck size={18} className="text-gray-400" /> Delivery Information
                </h3>
                {shipping ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase mb-1">Shipping Address</p>
                      <p className="text-sm font-semibold text-gray-900">{shipping.fullName}</p>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {shipping.streetAddress}<br />
                        {shipping.city}, {shipping.state} {shipping.postalCode}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase mb-1">Estimated Delivery</p>
                      <div className="bg-green-50 text-green-800 text-sm font-medium px-3 py-2 rounded-md inline-block">
                        {deliveryDateRange}
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1">Standard Shipping (5-7 business days)</p>
                    </div>
                  </div>
                ) : <p className="text-sm text-gray-500">No shipping info available</p>}
              </div>

              {/* Payment Info */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard size={18} className="text-gray-400" /> Payment Method
                </h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-6 border rounded bg-gray-50 flex items-center justify-center">
                    {paymentMethod === "COD" ? <Banknote size={14} className="text-gray-600" /> : <div className="w-6 h-4 bg-blue-800 rounded-sm"></div>}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {paymentMethod === "COD" ? "Cash on Delivery" : "Online Payment"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {paymentMethod === "COD" ? "Pay upon delivery" : "Paid via Razorpay"}
                    </p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="font-bold text-xs text-gray-700 mb-2">Contact Information</h4>
                  <p className="text-xs text-gray-600 flex items-center gap-2 mb-1">
                    <span className="w-4 flex justify-center">@</span> {email || "user@example.com"}
                  </p>
                  <p className="text-xs text-gray-600 flex items-center gap-2">
                    <Phone size={12} /> {shipping?.phone || "+91 98765 43210"}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN - Actions */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Next Steps</h3>
              <div className="space-y-3">
                <button onClick={() => navigate("/profile?tab=my-orders")} className="w-full bg-[#33022F] text-white h-10 rounded-md text-sm font-medium hover:bg-[#5a0452] transition flex items-center justify-center gap-2">
                  <Truck size={16} /> Track Order
                </button>
                <button onClick={handleDownloadInvoice} className="w-full bg-white border border-gray-200 text-gray-700 h-10 rounded-md text-sm font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2">
                  <Download size={16} /> Download Invoice
                </button>
                <button onClick={() => navigate("/")} className="w-full bg-white border border-gray-200 text-gray-700 h-10 rounded-md text-sm font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2">
                  <ShoppingBag size={16} /> Continue Shopping
                </button>
                <button className="w-full text-gray-500 text-xs hover:text-[#33022F] mt-2 flex items-center justify-center gap-1">
                  <Phone size={12} /> Contact Support
                </button>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
              <h3 className="font-bold text-blue-900 mb-2">Need Help?</h3>
              <p className="text-xs text-blue-700 mb-4 leading-relaxed">
                Our customer support team is available 24/7 to assist you with any questions regarding your order.
              </p>
              <a href="#" className="text-blue-700 text-sm font-bold flex items-center gap-1 hover:underline">
                Visit Help Center <ChevronRight size={14} />
              </a>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="mt-16 border-t border-gray-200 pt-12">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8 font-[Outfit]">You Might Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {recommendedProducts.map((product) => <div key={product.id} className="group cursor-pointer" onClick={() => navigate(`/products/${product.id}`)}>
              <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden mb-3 relative">
                <img src={product.imageUrls?.[0] || product.images?.[0]} alt={product.name} className="w-full h-full object-cover object-top transition duration-500 group-hover:scale-105" />
                <div className="absolute top-2 left-2 bg-black text-white text-[10px] uppercase font-bold px-2 py-1">New</div>
                <div className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full text-gray-700 opacity-0 group-hover:opacity-100 transition">
                  <ShoppingBag size={14} />
                </div>
              </div>
            </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrderSuccessPage;