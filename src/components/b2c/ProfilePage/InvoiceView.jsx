import React, { useRef, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import Barcode from "react-barcode";
import { auth } from "../../../config";
import villyLogo from "../../../assets/b2c/landing/Landing-villy/VillyLogo11.png";

const InvoiceView = ({ order, onBack }) => {
  const invoiceRef = useRef();
  const [downloading, setDownloading] = useState(false);

  // Format date helper function
  const formatDate = (date) => {
    if (!date) return "N/A";

    if (typeof date === "string") return date;

    if (date instanceof Date) {
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }

    if (date.toDate && typeof date.toDate === "function") {
      return date.toDate().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }

    return String(date);
  };

  const formatTime = (date) => {
    if (!date) return "";

    if (date instanceof Date) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }

    if (date.toDate && typeof date.toDate === "function") {
      return date.toDate().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }

    return "";
  };

  const handleDownloadPDF = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();

      // --- Load Villy Logo ---
      const logoLoaded = await new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = villyLogo;
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
      });

      let yPos = 15;

      // Add Villy Logo
      if (logoLoaded) {
        const logoWidth = 40;
        const logoHeight = 20;
        doc.addImage(logoLoaded, "PNG", (pageWidth - logoWidth) / 2, yPos, logoWidth, logoHeight);
        yPos += 28;
      } else {
        doc.setFontSize(22);
        doc.setTextColor(51, 2, 47);
        doc.text("VILLY", pageWidth / 2, yPos + 10, { align: "center" });
        yPos += 20;
      }

      // --- Invoice Title ---
      doc.setFontSize(16);
      doc.setTextColor(51, 2, 47);
      doc.text("INVOICE", pageWidth / 2, yPos, { align: "center" });
      yPos += 10;

      // Divider
      doc.setDrawColor(200, 200, 200);
      doc.line(20, yPos, pageWidth - 20, yPos);
      yPos += 8;

      // --- Order Info ---
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("Order ID:", 20, yPos);
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, "bold");
      doc.text(`#${order.orderId || order.id || "N/A"}`, 50, yPos);

      doc.setFont(undefined, "normal");
      doc.setTextColor(100, 100, 100);
      doc.text("Date:", 120, yPos);
      doc.setTextColor(0, 0, 0);
      doc.text(formatDate(order.createdAt || order.date), 135, yPos);
      yPos += 12;

      // --- Customer Information ---
      doc.setFontSize(12);
      doc.setFont(undefined, "bold");
      doc.setTextColor(51, 2, 47);
      doc.text("Customer Information", 20, yPos);
      yPos += 7;

      doc.setFontSize(10);
      doc.setFont(undefined, "normal");
      doc.setTextColor(80, 80, 80);

      doc.text(`Name: ${customerName}`, 20, yPos);
      yPos += 6;
      doc.text(`Email: ${customerEmail}`, 20, yPos);
      yPos += 6;

      // Handle long address with text wrapping
      const addressLines = doc.splitTextToSize(`Shipping Address: ${shippingAddress}`, pageWidth - 40);
      doc.text(addressLines, 20, yPos);
      yPos += addressLines.length * 5 + 8;

      // Divider
      doc.setDrawColor(200, 200, 200);
      doc.line(20, yPos, pageWidth - 20, yPos);
      yPos += 8;

      // --- Order Details Table ---
      doc.setFontSize(12);
      doc.setFont(undefined, "bold");
      doc.setTextColor(51, 2, 47);
      doc.text("Order Details", 20, yPos);
      yPos += 8;

      // Table Header
      doc.setFillColor(245, 245, 245);
      doc.rect(20, yPos - 4, pageWidth - 40, 8, "F");
      doc.setFontSize(9);
      doc.setFont(undefined, "bold");
      doc.setTextColor(60, 60, 60);
      doc.text("Product", 22, yPos);
      doc.text("Size", 110, yPos);
      doc.text("Qty", 130, yPos);
      doc.text("Price", 150, yPos);
      doc.text("Total", 173, yPos);
      yPos += 8;

      // Table Rows
      doc.setFont(undefined, "normal");
      doc.setTextColor(0, 0, 0);

      order.products?.forEach((product) => {
        const productName = (product.name || "Product").length > 40
          ? (product.name || "Product").substring(0, 40) + "..."
          : (product.name || "Product");
        const qty = product.quantity || 1;
        const price = product.price || 0;

        doc.text(productName, 22, yPos);
        doc.text(product.size || "N/A", 110, yPos);
        doc.text(String(qty), 130, yPos);
        doc.text(`₹${price.toLocaleString()}`, 150, yPos);
        doc.text(`₹${(price * qty).toLocaleString()}`, 173, yPos);
        yPos += 7;
      });

      // Divider
      yPos += 3;
      doc.setDrawColor(200, 200, 200);
      doc.line(20, yPos, pageWidth - 20, yPos);
      yPos += 8;

      // --- Pricing Summary ---
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text("Subtotal:", 130, yPos);
      doc.text(`₹${subtotal.toLocaleString()}`, 173, yPos);
      yPos += 6;

      doc.text("Delivery Fee:", 130, yPos);
      doc.text(`₹${deliveryFee}`, 173, yPos);
      yPos += 8;

      doc.setFont(undefined, "bold");
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text("Total:", 130, yPos);
      doc.text(`₹${total.toLocaleString()}`, 170, yPos);
      yPos += 12;

      // Divider
      doc.setDrawColor(200, 200, 200);
      doc.line(20, yPos, pageWidth - 20, yPos);
      yPos += 8;

      // --- Payment Details ---
      doc.setFontSize(12);
      doc.setFont(undefined, "bold");
      doc.setTextColor(51, 2, 47);
      doc.text("Payment Details", 20, yPos);
      yPos += 7;

      doc.setFontSize(10);
      doc.setFont(undefined, "normal");
      doc.setTextColor(80, 80, 80);

      doc.text(`Payment Mode: ${paymentMode}`, 20, yPos);
      yPos += 6;
      doc.text(`Transaction ID: ${transactionId}`, 20, yPos);
      yPos += 6;
      doc.text(`Payment Date: ${formatDate(paymentDate)} ${formatTime(paymentDate)}`, 20, yPos);
      yPos += 6;
      doc.text(`Bank: ${bankName}`, 20, yPos);
      yPos += 15;

      // --- Footer ---
      doc.setDrawColor(200, 200, 200);
      doc.line(20, yPos, pageWidth - 20, yPos);
      yPos += 8;

      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text("Thank you for shopping with Villy!", pageWidth / 2, yPos, { align: "center" });
      yPos += 4;
      doc.text("For queries, reach out to support@villy.com", pageWidth / 2, yPos, { align: "center" });

      doc.save(`Villy_Invoice_${order.orderId || order.id || "Order"}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  // Calculate totals dynamically
  const calculateSubtotal = () => {
    return (
      order.products?.reduce((sum, item) => {
        return sum + (item.price || 0) * (item.quantity || 1);
      }, 0) || 0
    );
  };

  const deliveryFee = 100;
  const subtotal = calculateSubtotal();
  const total = order.amount || subtotal + deliveryFee;

  // Dynamic customer info
  const customerName =
    order.shipping?.firstName && order.shipping?.lastName
      ? `${order.shipping.firstName} ${order.shipping.lastName}`
      : order.customerName || "N/A";

  const customerEmail = order.email || auth.currentUser?.email || "N/A";

  // Dynamic shipping address
  const shippingAddress = order.shipping
    ? `${order.shipping.streetAddress || order.shipping.address || ""}, ${order.shipping.city || ""}, ${order.shipping.state || order.shipping.stateProvince || ""}, ${order.shipping.postalCode || order.shipping.zipPostalCode || ""}, ${order.shipping.country || ""}`
    : order.shippingAddress?.fullAddress || order.shippingAddress?.address || "N/A";

  // Dynamic payment info
  const paymentMode = order.paymentMethod?.toUpperCase() || "N/A";

  const transactionId =
    order.payment?.razorpay_payment_id || order.transactionId || order.orderId || "N/A";

  const bankName = order.bankName || (order.paymentMethod === "cod" ? "Cash on Delivery" : "N/A");

  const paymentDate = order.paymentDate || order.createdAt || order.date;

  return (
    <div className="min-h-screen bg-gray-50 md:p-6 pb-20 md:pb-6">
      <button
        onClick={onBack}
        className="hidden md:block mb-6 text-gray-600 font-medium hover:text-gray-900 transition-colors"
      >
        ← Back to Orders
      </button>

      <div ref={invoiceRef} className="max-w-5xl mx-auto bg-white md:shadow-lg md:p-8">
        {/* Header with Logo, Barcode and Download */}
        <div className="mb-6 pb-6">
          {/* Villy Logo */}
          <div className="flex justify-center mb-6">
            <img src={villyLogo} alt="Villy" className="h-16 w-auto object-contain" />
          </div>

          <div className="flex flex-col items-center md:flex-row md:justify-between md:items-start gap-4">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-3 md:gap-4 w-full md:w-auto">
              <div className="bg-white">
                <Barcode
                  value={order.orderId || order.id || "287368838"}
                  width={1.3}
                  height={50}
                  fontSize={0}
                  margin={0}
                />
              </div>
              <div className="text-center md:text-left">
                <p className="text-sm md:text-lg font-semibold text-gray-900">
                  Order ID: {order.orderId || order.id}
                </p>
                <p className="text-xs md:text-base text-gray-600">
                  {formatDate(order.createdAt || order.date)}{" "}
                  {formatTime(order.createdAt || order.date)}
                </p>
              </div>
            </div>

            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="hidden md:flex items-center gap-2 bg-[#8B1B1B] hover:bg-[#6d1515] disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded font-medium transition-colors"
            >
              {downloading ? (
                <><Loader2 size={16} className="animate-spin" /> Generating...</>
              ) : (
                "Download Invoice"
              )}
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="flex flex-col md:grid md:grid-cols-2  gap-4 md:gap-8 p-12 md:p-0">
          {/* Left Column - Order Details */}
          <div className=" border border-black">
            <h2 className="text-base md:text-xl font-semibold text-gray-900 p-3 md:p-4 ">
              Order Details
            </h2>

            <div className="p-3     md:p-4">
              {order.products?.map((product, index) => (
                <div key={index} className="mb-4 md:mb-6 pb-4 md:pb-6 last:border-0">
                  <div className="flex gap-3 md:gap-4">
                    <img
                      src={product.image || "https://via.placeholder.com/120"}
                      alt={product.name}
                      className="w-16 h-20 md:w-24 md:h-28 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-1">
                        {product.name || "Product Name"}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-600 mb-2">
                        {product.description || product.desc || "Product description"}
                      </p>
                      <div className="flex gap-3 md:gap-4 text-xs md:text-sm">
                        <span className="text-gray-700">
                          <span className="font-medium">Size:</span> {product.size || "N/A"}
                        </span>
                        <span className="text-gray-700">
                          <span className="font-medium">Qty:</span> {product.quantity || 1}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Order Summary */}
              <div className="space-y-3 mt-6 pt-4 ">
                <div className="flex justify-between text-xs md:text-sm">
                  <span className="text-gray-700">ID</span>
                  <span className="text-gray-900">#{order.orderId || order.id}</span>
                </div>
                <div className="flex justify-between text-xs md:text-sm">
                  <span className="text-gray-700">Product Name:</span>
                  <span className="text-gray-900">{order.products?.[0]?.name || "N/A"}</span>
                </div>
                <div className="flex justify-between text-xs md:text-sm">
                  <span className="text-gray-700">Qty</span>
                  <span className="text-gray-900">
                    x{order.products?.reduce((sum, p) => sum + (p.quantity || 0), 0) || 0}
                  </span>
                </div>
                <div className="flex justify-between text-xs md:text-sm">
                  <span className="text-gray-700">Price</span>
                  <span className="text-gray-900">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs md:text-sm">
                  <span className="text-gray-700">Delivery Fee</span>
                  <span className="text-gray-900">₹{deliveryFee}</span>
                </div>
                <div className="flex justify-between text-sm md:text-base font-semibold pt-2 ">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900">₹{total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Customer & Payment Info */}
          <div className="flex flex-col gap-4 md:-mt-15  md:gap-6">
            {/* Customer Information */}
            <div className=" ">
              <h2 className="text-base md:text-xl font-semibold text-gray-900 p-3 md:p-4 ">
                Customer Information
              </h2>

              <div className="p-3 md:p-4 space-y-3 border border-black md:space-y-4">
                <div>
                  <p className="text-xs md:text-sm text-gray-600 mb-1">Name</p>
                  <p className="text-sm md:text-base text-gray-900 font-medium">{customerName}</p>
                </div>

                <div>
                  <p className="text-xs md:text-sm text-gray-600 mb-1">E-Mail</p>
                  <p className="text-sm md:text-base text-gray-900">{customerEmail}</p>
                </div>

                <div>
                  <p className="text-xs md:text-sm text-gray-600 mb-1">Shipping Address</p>
                  <p className="text-sm md:text-base text-gray-900">{shippingAddress}</p>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className=" ">
              <h2 className="text-base md:text-xl font-semibold text-gray-900 p-3 md:p-4">
                Payment Details
              </h2>

              <div className="p-3 md:p-4 space-y-3 md:space-y-4 border border-black">
                <div>
                  <p className="text-xs md:text-sm text-gray-600 mb-1">Payment Mode</p>
                  <p className="text-sm md:text-base text-gray-900 font-medium">{paymentMode}</p>
                </div>

                <div>
                  <p className="text-xs md:text-sm text-gray-600 mb-1">Transaction ID</p>
                  <p className="text-sm md:text-base text-gray-900">{transactionId}</p>
                </div>

                <div>
                  <p className="text-xs md:text-sm text-gray-600 mb-1">Payment Date</p>
                  <p className="text-sm md:text-base text-gray-900">
                    {formatDate(paymentDate)} {formatTime(paymentDate)}
                  </p>
                </div>

                <div>
                  <p className="text-xs md:text-sm text-gray-600 mb-1">Bank Name</p>
                  <p className="text-sm md:text-base text-gray-900">{bankName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Download Button - Mobile Only (Fixed at bottom) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg">
        <button
          onClick={handleDownloadPDF}
          disabled={downloading}
          className="w-full flex items-center justify-center gap-2 bg-[#8B1B1B] hover:bg-[#6d1515] disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-3 rounded font-medium transition-colors"
        >
          {downloading ? (
            <><Loader2 size={16} className="animate-spin" /> Generating...</>
          ) : (
            "Download Invoice"
          )}
        </button>
      </div>
    </div>
  );
};

export default InvoiceView;
