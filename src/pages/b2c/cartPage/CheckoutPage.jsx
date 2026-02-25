import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Check,
  CreditCard,
  Banknote,
  CircleCheck,
  MapPin,
  Truck,
  Shield,
  Loader2,
} from "lucide-react";
import { State } from "country-state-city";
import { httpsCallable } from "firebase/functions";
import { auth, functions } from "../../../config";
import { cartService } from "../../../services/cartService";
import orderService from "../../../services/orderService";
import B2BAuthService from "../../../services/b2bAuthService";
import B2BAddressService from "../../../services/b2bAddressService";
import { toast } from "react-toastify";

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

const THEME = {
  primary: "#33022F",
  primaryDark: "#2A0820",
  primaryLight: "#33022F0D",
};

// ─── Helpers ────────────────────────────────────────────

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const parsePrice = (price) => {
  if (!price) return 0;
  return parseFloat(String(price).replace(/[^0-9.]/g, "")) || 0;
};

const validatePhone = (phone) => /^[6-9]\d{9}$/.test(phone.replace(/\s+/g, ""));
const validatePincode = (pin) => /^\d{6}$/.test(pin);
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const transformCartData = (cartItems) => {
  const transformed = [];
  if (!Array.isArray(cartItems)) return [];

  cartItems.forEach((item) => {
    if (item.variants && Array.isArray(item.variants) && item.variants.length > 0) {
      item.variants.forEach((variant) => {
        transformed.push({
          id: item.productId || item.id,
          productId: item.productId || item.id,
          name: item.name,
          price: parsePrice(item.price),
          image: item.imageUrls?.[0] || item.image || "/placeholder.jpg",
          color: variant.color || "Default",
          size: variant.size || "M",
          quantity: variant.quantity || 1,
        });
      });
    } else {
      transformed.push({
        id: item.productId || item.id,
        productId: item.productId || item.id,
        name: item.name,
        price: parsePrice(item.price),
        image: item.imageUrls?.[0] || item.image || "/placeholder.jpg",
        color: item.color || "Default",
        size: item.size || "M",
        quantity: item.quantity || 1,
      });
    }
  });
  return transformed;
};

// ─── Shipping Methods ───────────────────────────────────

const SHIPPING_METHODS = [
  { id: "standard", name: "Standard Shipping", description: "5-7 business days", price: 0 },
  { id: "express", name: "Express Shipping", description: "2-3 business days", price: 149 },
];

// ─── Component ──────────────────────────────────────────

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // User
  const [userDetails, setUserDetails] = useState({
    id: null, email: "", role: null, isLoggedIn: false, addresses: [], loading: true,
  });

  // Cart
  const [cartItems, setCartItems] = useState([]);
  const [transformedCartItems, setTransformedCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Shipping
  const [shippingForm, setShippingForm] = useState({
    fullName: "", firstName: "", lastName: "",
    streetAddress: "", addressLine2: "",
    city: "", state: "", postalCode: "",
    country: "India", phone: "",
  });
  const [selectedStateCode, setSelectedStateCode] = useState("");
  const [selectedShippingMethod, setSelectedShippingMethod] = useState(SHIPPING_METHODS[0]);

  // Steps & payment
  const [openStep, setOpenStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("online"); // "online" | "cod"
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [email, setEmail] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState({});

  // Server-side price (from Cloud Function)
  const [serverPricing, setServerPricing] = useState(null);

  // ─── Fetch User ──────────────────────────────────────

  useEffect(() => {
    const fetchUserDetails = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const userData = await B2BAuthService.getUserById(currentUser.uid);
          if (userData?.data) {
            const addressesResponse = await B2BAddressService.getAddresses(
              currentUser.uid,
              userData.data.role || "B2C"
            );
            setUserDetails({
              id: currentUser.uid,
              email: userData.data.email || currentUser.email,
              role: userData.data.role || "B2C",
              isLoggedIn: true,
              addresses: addressesResponse.success ? addressesResponse.data : [],
              loading: false,
            });
          } else {
            setUserDetails({
              id: currentUser.uid, email: currentUser.email,
              role: "B2C", isLoggedIn: true, addresses: [], loading: false,
            });
          }
        } catch {
          setUserDetails({
            id: currentUser.uid, email: currentUser.email,
            role: "B2C", isLoggedIn: true, addresses: [], loading: false,
          });
        }
      } else {
        setUserDetails((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchUserDetails();
    const unsub = auth.onAuthStateChanged((user) => {
      if (!user) setUserDetails((prev) => ({ ...prev, isLoggedIn: false, loading: false }));
      else fetchUserDetails();
    });
    return () => unsub();
  }, []);

  // ─── Pre-fill Address ────────────────────────────────

  useEffect(() => {
    if (userDetails.isLoggedIn && userDetails.addresses.length > 0) {
      const defaultAddr = userDetails.addresses.find((a) => a.isDefault);
      if (defaultAddr) {
        setShippingForm({
          fullName: `${defaultAddr.firstName || ""} ${defaultAddr.lastName || ""}`.trim(),
          firstName: defaultAddr.firstName || "",
          lastName: defaultAddr.lastName || "",
          streetAddress: defaultAddr.address || "",
          addressLine2: "",
          city: defaultAddr.city || "",
          state: defaultAddr.stateProvince || "",
          postalCode: defaultAddr.zipPostalCode || "",
          country: defaultAddr.country || "India",
          phone: defaultAddr.phone || "",
        });
      }
    }
  }, [userDetails.addresses, userDetails.isLoggedIn]);

  // ─── Load Cart ───────────────────────────────────────

  useEffect(() => {
    const loadCart = async () => {
      if (userDetails.loading) return;

      if (location.state?.cartItems?.length > 0) {
        setCartItems(location.state.cartItems);
        setTransformedCartItems(transformCartData(location.state.cartItems));
        setIsLoading(false);
      } else if (userDetails.isLoggedIn) {
        try {
          const items = await cartService.getCart();
          if (items.length === 0) {
            navigate("/cart", { replace: true });
            return;
          }
          setCartItems(items);
          setTransformedCartItems(transformCartData(items));
        } catch (err) {
          console.error("Failed to load cart:", err);
          toast.error("Failed to load your cart. Please try again.");
        } finally {
          setIsLoading(false);
        }
      } else {
        const guest = JSON.parse(sessionStorage.getItem("guest_cart") || "[]");
        if (guest.length === 0) {
          navigate("/cart", { replace: true });
          return;
        }
        setCartItems(guest);
        setTransformedCartItems(transformCartData(guest));
        setIsLoading(false);
      }
    };
    loadCart();
  }, [location.state, userDetails.isLoggedIn, userDetails.loading, navigate]);

  // ─── Client-side Estimates (display only — real total comes from server) ──

  const subtotalEstimate = transformedCartItems.reduce(
    (sum, item) => sum + item.price * item.quantity, 0
  );
  const shippingFee = selectedShippingMethod.price;
  const taxEstimate = Math.round(subtotalEstimate * 0.18 * 100) / 100;
  const totalEstimate = subtotalEstimate + shippingFee + taxEstimate;

  // ─── Handlers ────────────────────────────────────────

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleProceedToPayment = () => {
    const newErrors = {};
    if (!shippingForm.fullName?.trim()) newErrors.fullName = "Full name is required";

    const finalEmail = userDetails.email || email;
    if (!finalEmail?.trim()) newErrors.email = "Email is required";
    else if (!validateEmail(finalEmail)) newErrors.email = "Enter a valid email address";

    if (!shippingForm.phone?.trim()) newErrors.phone = "Phone number is required";
    else if (!validatePhone(shippingForm.phone)) newErrors.phone = "Enter a valid 10-digit Indian phone number";

    if (!shippingForm.streetAddress?.trim()) newErrors.streetAddress = "Address is required";
    if (!shippingForm.city?.trim()) newErrors.city = "City is required";
    if (!shippingForm.state?.trim()) newErrors.state = "State is required";

    if (!shippingForm.postalCode?.trim()) newErrors.postalCode = "PIN code is required";
    else if (!validatePincode(shippingForm.postalCode)) newErrors.postalCode = "Enter a valid 6-digit PIN code";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Split name
    if (shippingForm.fullName && (!shippingForm.firstName || !shippingForm.lastName)) {
      const names = shippingForm.fullName.trim().split(" ");
      setShippingForm((prev) => ({
        ...prev,
        firstName: names[0],
        lastName: names.slice(1).join(" ") || ".",
      }));
    }

    setOpenStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleProceedToReview = () => {
    setOpenStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ─── PAY NOW ─────────────────────────────────────────

  const handlePayNow = useCallback(async () => {
    if (isProcessingPayment) return; // Prevent double-click
    setIsProcessingPayment(true);

    const finalEmail = userDetails.email || email;
    let finalShippingForm = { ...shippingForm };
    if (!finalShippingForm.firstName || !finalShippingForm.lastName) {
      const names = finalShippingForm.fullName.trim().split(" ");
      finalShippingForm.firstName = names[0];
      finalShippingForm.lastName = names.slice(1).join(" ") || ".";
    }

    // ── COD Flow ──
    if (paymentMethod === "cod") {
      try {
        const orderResult = userDetails.isLoggedIn
          ? await orderService.moveCartToOrder(
            {
              products: transformedCartItems,
              paymentMethod: "cod",
              shipping: finalShippingForm,
              amount: totalEstimate,
              status: "Active",
              email: finalEmail,
              userId: userDetails.id || null,
              userRole: userDetails.role || "B2C",
            },
            cartItems
          )
          : await orderService.createOrder({
            products: transformedCartItems,
            paymentMethod: "cod",
            shipping: finalShippingForm,
            amount: totalEstimate,
            status: "Active",
            email: finalEmail,
            userId: userDetails.id || null,
            userRole: userDetails.role || "B2C",
          });

        // Clear cart
        try {
          if (userDetails.isLoggedIn) await cartService.clearCart();
          else sessionStorage.removeItem("guest_cart");
        } catch (clearErr) {
          console.warn("Cart clear warning:", clearErr);
        }

        navigate("/order-success", {
          state: {
            orderId: orderResult.orderId,
            paymentMethod: "COD",
            items: transformedCartItems,
            shipping: finalShippingForm,
            total: totalEstimate,
            email: finalEmail,
          },
        });
      } catch (err) {
        console.error("COD Order Error:", err);
        toast.error(`Order failed: ${err.message || "Please try again."}`);
      } finally {
        setIsProcessingPayment(false);
      }
      return;
    }

    // ── Online Payment (Razorpay) ──
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      toast.error("Failed to load payment gateway. Please check your connection.");
      setIsProcessingPayment(false);
      return;
    }

    try {
      // 1. Create Razorpay order SERVER-SIDE (server calculates price from Firestore)
      const createOrder = httpsCallable(functions, "createRazorpayOrder");
      const { data } = await createOrder({
        cartItems: transformedCartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
        })),
        shippingFee: selectedShippingMethod.price,
      });

      if (!data?.success || !data?.order) {
        throw new Error("Failed to create payment order");
      }

      const order = data.order;

      // Store server pricing for display
      if (data.serverTotal) {
        setServerPricing({
          subtotal: data.breakdown?.subtotal,
          tax: data.breakdown?.tax || 0,
          shippingFee: data.breakdown?.shippingFee || 0,
          total: data.serverTotal,
        });
      }

      // 2. Open Razorpay Checkout (Razorpay handles Card/UPI/Wallet natively)
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "VILLY",
        description: "Order Payment",
        order_id: order.id,
        handler: async (response) => {
          try {
            // 3. Verify payment & create order SERVER-SIDE (atomically)
            const verify = httpsCallable(functions, "verifyRazorpayPayment");
            const result = await verify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              shipping: finalShippingForm,
              email: finalEmail,
              paymentMethod: "online",
            });

            if (result.data.success) {
              navigate("/order-success", {
                state: {
                  orderId: result.data.orderId,
                  paymentMethod: "ONLINE",
                  items: transformedCartItems,
                  shipping: finalShippingForm,
                  total: data.serverTotal || totalEstimate,
                  email: finalEmail,
                },
              });
            } else {
              toast.error("Payment verification failed. Please contact support.");
              setIsProcessingPayment(false);
            }
          } catch (err) {
            console.error("Payment Verification Error:", err);
            toast.error(
              "Payment verification error. If money was deducted, it will be refunded within 5-7 days. Please contact support."
            );
            setIsProcessingPayment(false);
          }
        },
        prefill: {
          name: finalShippingForm.fullName || "Customer",
          email: finalEmail,
          contact: finalShippingForm.phone || "",
        },
        theme: { color: THEME.primary },
        modal: {
          ondismiss: () => {
            setIsProcessingPayment(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        console.error("Payment failed:", response.error);
        toast.error(
          `Payment failed: ${response.error.description || "Please try again."}`
        );
        setIsProcessingPayment(false);
      });
      rzp.open();
    } catch (err) {
      console.error("Payment Initiation Error:", err);
      toast.error(`Payment failed: ${err.message || "Please try again."}`);
      setIsProcessingPayment(false);
    }
  }, [
    isProcessingPayment, userDetails, email, shippingForm, paymentMethod,
    transformedCartItems, cartItems, totalEstimate, selectedShippingMethod, navigate,
  ]);

  // ─── Loading & Empty States ──────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#33022F]" />
        <p className="text-gray-500 text-sm">Loading checkout...</p>
      </div>
    );
  }

  if (transformedCartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Your cart is empty.</p>
        <Link to="/womenwear" className="text-[#33022F] font-bold underline">
          Continue Shopping
        </Link>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────

  const STEPS = ["Shipping", "Payment", "Review", "Confirmation"];
  const displayTotal = serverPricing?.total || totalEstimate;
  const displaySubtotal = serverPricing?.subtotal || subtotalEstimate;
  const displayTax = serverPricing?.tax || taxEstimate;

  return (
    <div className="min-h-screen bg-white font-[Outfit]">
      {/* Processing Overlay */}
      {isProcessingPayment && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-white" />
          <p className="text-white font-medium text-lg">Processing your payment...</p>
          <p className="text-white/70 text-sm">Please do not close this window</p>
        </div>
      )}

      {/* Progress Bar */}
      <div className="w-full pt-6 pb-2">
        <div className="max-w-6xl mx-auto px-4 h-24 flex items-center justify-center gap-2 md:gap-4 overflow-x-auto scrollbar-hide">
          {STEPS.map((step, idx) => {
            const stepNum = idx + 1;
            const isActive = openStep === stepNum;
            const isCompleted = openStep > stepNum;
            return (
              <div
                key={step}
                className="flex flex-col items-center cursor-pointer"
                onClick={() => stepNum < openStep && setOpenStep(stepNum)}
              >
                <span
                  className={`text-xs md:text-sm font-bold uppercase tracking-wider mb-2 transition-colors duration-300 ${isActive || isCompleted ? "text-[#33022F]" : "text-gray-300"
                    }`}
                >
                  {step}
                </span>
                <div
                  className={`w-16 md:w-32 h-2 rounded-full transition-all duration-300 ${isActive || isCompleted ? "bg-[#33022F]" : "bg-gray-200"
                    }`}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* ─── LEFT COLUMN ─── */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-10">
            {/* STEP 1: Shipping */}
            {openStep === 1 && (
              <>
                <Link
                  to="/cart"
                  className="flex items-center text-gray-500 text-sm font-medium hover:text-[#33022F] mb-6"
                >
                  ← Back to Cart
                </Link>

                <h1 className="text-2xl font-bold text-gray-900 mb-6">
                  Shipping Information
                </h1>

                {/* Shipping Form */}
                <div className="space-y-6">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      name="fullName"
                      value={shippingForm.fullName}
                      onChange={handleShippingChange}
                      placeholder="Enter your full name"
                      className={`w-full h-12 px-4 border rounded-md outline-none transition ${errors.fullName
                          ? "border-red-500 ring-1 ring-red-500"
                          : "border-gray-200 focus:border-[#33022F] focus:ring-1 focus:ring-[#33022F]"
                        }`}
                    />
                    {errors.fullName && (
                      <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
                    )}
                  </div>

                  {/* Email + Phone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        value={userDetails.email || email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                        }}
                        readOnly={!!userDetails.isLoggedIn && !!userDetails.email}
                        placeholder="your@email.com"
                        type="email"
                        className={`w-full h-12 px-4 border rounded-md outline-none transition ${errors.email
                            ? "border-red-500 ring-1 ring-red-500"
                            : "border-gray-200 focus:border-[#33022F] focus:ring-1 focus:ring-[#33022F]"
                          } ${userDetails.isLoggedIn && userDetails.email ? "bg-gray-50" : ""}`}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        name="phone"
                        value={shippingForm.phone}
                        onChange={handleShippingChange}
                        placeholder="9876543210"
                        maxLength={10}
                        className={`w-full h-12 px-4 border rounded-md outline-none transition ${errors.phone
                            ? "border-red-500 ring-1 ring-red-500"
                            : "border-gray-200 focus:border-[#33022F] focus:ring-1 focus:ring-[#33022F]"
                          }`}
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                      )}
                    </div>
                  </div>

                  {/* Address Line 1 */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Address Line 1 *
                    </label>
                    <input
                      name="streetAddress"
                      value={shippingForm.streetAddress}
                      onChange={handleShippingChange}
                      placeholder="Street address"
                      className={`w-full h-12 px-4 border rounded-md outline-none transition ${errors.streetAddress
                          ? "border-red-500 ring-1 ring-red-500"
                          : "border-gray-200 focus:border-[#33022F] focus:ring-1 focus:ring-[#33022F]"
                        }`}
                    />
                    {errors.streetAddress && (
                      <p className="text-red-500 text-xs mt-1">{errors.streetAddress}</p>
                    )}
                  </div>

                  {/* Address Line 2 */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Address Line 2
                    </label>
                    <input
                      name="addressLine2"
                      value={shippingForm.addressLine2}
                      onChange={handleShippingChange}
                      placeholder="Apartment, suite, etc. (optional)"
                      className="w-full h-12 px-4 border border-gray-200 rounded-md focus:border-[#33022F] focus:ring-1 focus:ring-[#33022F] outline-none transition"
                    />
                  </div>

                  {/* City / State / PIN */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        name="city"
                        value={shippingForm.city}
                        onChange={handleShippingChange}
                        placeholder="City"
                        className={`w-full h-12 px-4 border rounded-md outline-none transition ${errors.city
                            ? "border-red-500 ring-1 ring-red-500"
                            : "border-gray-200 focus:border-[#33022F] focus:ring-1 focus:ring-[#33022F]"
                          }`}
                      />
                      {errors.city && (
                        <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        State *
                      </label>
                      <select
                        value={selectedStateCode}
                        onChange={(e) => {
                          setSelectedStateCode(e.target.value);
                          const s = State.getStateByCodeAndCountry(e.target.value, "IN");
                          setShippingForm((prev) => ({ ...prev, state: s?.name || "" }));
                          if (errors.state)
                            setErrors((prev) => ({ ...prev, state: "" }));
                        }}
                        className={`w-full h-12 px-4 border rounded-md outline-none transition bg-white ${errors.state
                            ? "border-red-500 ring-1 ring-red-500"
                            : "border-gray-200 focus:border-[#33022F] focus:ring-1 focus:ring-[#33022F]"
                          }`}
                      >
                        <option value="">Select State</option>
                        {State.getStatesOfCountry("IN").map((s) => (
                          <option key={s.isoCode} value={s.isoCode}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                      {errors.state && (
                        <p className="text-red-500 text-xs mt-1">{errors.state}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        PIN Code *
                      </label>
                      <input
                        name="postalCode"
                        value={shippingForm.postalCode}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          setShippingForm((prev) => ({ ...prev, postalCode: val }));
                          if (errors.postalCode)
                            setErrors((prev) => ({ ...prev, postalCode: "" }));
                        }}
                        placeholder="110001"
                        maxLength={6}
                        inputMode="numeric"
                        className={`w-full h-12 px-4 border rounded-md outline-none transition ${errors.postalCode
                            ? "border-red-500 ring-1 ring-red-500"
                            : "border-gray-200 focus:border-[#33022F] focus:ring-1 focus:ring-[#33022F]"
                          }`}
                      />
                      {errors.postalCode && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.postalCode}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Shipping Method */}
                <div className="mt-12">
                  <h2 className="text-lg font-bold text-gray-900 mb-6">
                    Shipping Method
                  </h2>
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    {SHIPPING_METHODS.map((method, idx) => {
                      const isSelected = selectedShippingMethod.id === method.id;
                      return (
                        <div
                          key={method.id}
                          onClick={() => setSelectedShippingMethod(method)}
                          className={`relative flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition ${idx !== SHIPPING_METHODS.length - 1
                              ? "border-b border-gray-200"
                              : ""
                            } ${isSelected ? "bg-[#33022F]/5" : ""}`}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? "border-[#33022F]" : "border-gray-300"
                                }`}
                            >
                              {isSelected && (
                                <div className="w-2.5 h-2.5 rounded-full bg-[#33022F]" />
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-sm md:text-base">
                                {method.name}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {method.description}
                              </p>
                            </div>
                          </div>
                          <span className="font-bold text-gray-900">
                            {method.price === 0
                              ? "FREE"
                              : `₹${method.price.toLocaleString()}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* STEP 2: Payment Method */}
            {openStep === 2 && (
              <div className="space-y-6">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-[#33022F] mb-1">
                    Payment Method
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Choose how you'd like to pay
                  </p>
                </div>

                {/* Two payment options: Online & COD */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {/* Online Payment */}
                  <div
                    onClick={() => setPaymentMethod("online")}
                    style={{
                      background:
                        paymentMethod === "online"
                          ? "linear-gradient(180deg, #33022F 0%, #5A0452 100%)"
                          : "",
                    }}
                    className={`p-5 rounded-lg border cursor-pointer transition-all ${paymentMethod === "online"
                        ? "text-white border-[#33022F] shadow-lg"
                        : "bg-white border-gray-200 text-gray-700 hover:border-[#33022F]"
                      }`}
                  >
                    <div className="flex justify-between items-start">
                      <div
                        className={`p-2 rounded-full mb-3 ${paymentMethod === "online" ? "bg-white/10" : "bg-gray-100"
                          }`}
                      >
                        <CreditCard
                          size={20}
                          className={
                            paymentMethod === "online"
                              ? "text-white"
                              : "text-gray-600"
                          }
                        />
                      </div>
                      {paymentMethod === "online" && (
                        <CircleCheck size={20} className="text-white" />
                      )}
                    </div>
                    <h4 className="font-bold text-sm">Pay Online</h4>
                    <p
                      className={`text-xs mt-1 ${paymentMethod === "online"
                          ? "text-white/70"
                          : "text-gray-500"
                        }`}
                    >
                      Card, UPI, Net Banking, Wallets
                    </p>
                  </div>

                  {/* Cash on Delivery */}
                  <div
                    onClick={() => setPaymentMethod("cod")}
                    style={{
                      background:
                        paymentMethod === "cod"
                          ? "linear-gradient(180deg, #33022F 0%, #5A0452 100%)"
                          : "",
                    }}
                    className={`p-5 rounded-lg border cursor-pointer transition-all ${paymentMethod === "cod"
                        ? "text-white border-[#33022F] shadow-lg"
                        : "bg-white border-gray-200 text-gray-700 hover:border-[#33022F]"
                      }`}
                  >
                    <div className="flex justify-between items-start">
                      <div
                        className={`p-2 rounded-full mb-3 ${paymentMethod === "cod" ? "bg-white/10" : "bg-gray-100"
                          }`}
                      >
                        <Banknote
                          size={20}
                          className={
                            paymentMethod === "cod"
                              ? "text-white"
                              : "text-gray-600"
                          }
                        />
                      </div>
                      {paymentMethod === "cod" && (
                        <CircleCheck size={20} className="text-white" />
                      )}
                    </div>
                    <h4 className="font-bold text-sm">Cash on Delivery</h4>
                    <p
                      className={`text-xs mt-1 ${paymentMethod === "cod"
                          ? "text-white/70"
                          : "text-gray-500"
                        }`}
                    >
                      Pay when you receive your order
                    </p>
                  </div>
                </div>

                {/* Info panels */}
                <div className="border border-gray-200 rounded-lg p-6">
                  {paymentMethod === "online" && (
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-[#33022F] rounded-full text-white flex-shrink-0">
                        <Shield size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 mb-2">
                          Secure Online Payment
                        </h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          You'll be redirected to Razorpay's secure payment gateway
                          where you can pay using Credit/Debit Card, UPI (GPay,
                          PhonePe, Paytm), Net Banking, or Wallets. Your card details
                          are never stored on our servers.
                        </p>
                        <div className="mt-3 flex items-center gap-2 text-green-600">
                          <Shield size={14} />
                          <span className="text-xs font-medium">
                            256-bit SSL encrypted • PCI DSS compliant
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "cod" && (
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-[#33022F] rounded-full text-white flex-shrink-0">
                        <Banknote size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 mb-2">
                          Cash on Delivery
                        </h4>
                        <ul className="text-sm text-gray-600 space-y-2 list-disc pl-4">
                          <li>Pay directly to our delivery partner in cash</li>
                          <li>Please keep exact change ready</li>
                          <li>Available for orders under ₹50,000</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setOpenStep(1)}
                  className="text-sm text-gray-500 underline hover:text-[#33022F]"
                >
                  ← Back to Shipping
                </button>
              </div>
            )}

            {/* STEP 3: Review */}
            {openStep === 3 && (
              <div className="space-y-6">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-[#33022F] mb-1">
                    Review Your Order
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Please review your order details before placing your order
                  </p>
                </div>

                {/* Order Items */}
                <div className="bg-white border rounded-lg p-6 mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-[#33022F]/10 rounded-full text-[#33022F]">
                      <Check size={16} />
                    </div>
                    <h4 className="font-bold text-gray-800">
                      Order Items ({transformedCartItems.length})
                    </h4>
                  </div>
                  <div className="space-y-6">
                    {transformedCartItems.map((item, idx) => (
                      <div
                        key={`${item.id}-${idx}`}
                        className="flex gap-4 border-b border-gray-100 last:border-0 pb-4 last:pb-0"
                      >
                        <div className="w-20 h-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-700 font-medium mb-1">
                            {item.name}
                          </p>
                          <div className="text-xs text-gray-500 mb-1">
                            {item.color} • {item.size} • Qty: {item.quantity}
                          </div>
                        </div>
                        <div className="flex flex-col justify-end items-end">
                          <span className="font-bold text-lg text-[#33022F]">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Address Review */}
                <div className="bg-white border rounded-lg p-6 mb-4 flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className="p-2 bg-[#33022F] rounded-full text-white h-fit">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 mb-2">
                        Shipping Address
                      </h4>
                      <p className="font-bold text-sm text-gray-900">
                        {shippingForm.fullName}
                      </p>
                      <p className="text-sm text-gray-600 w-3/4 leading-relaxed mt-1">
                        {shippingForm.streetAddress}, {shippingForm.city},{" "}
                        {shippingForm.state} {shippingForm.postalCode}
                      </p>
                      <p className="text-sm text-gray-600 mt-2 font-medium">
                        {shippingForm.phone}
                      </p>
                      <p className="text-sm text-gray-600">
                        {email || userDetails.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setOpenStep(1)}
                    className="text-[#33022F] font-bold text-xs uppercase hover:underline"
                  >
                    Edit
                  </button>
                </div>

                {/* Payment Method Review */}
                <div className="bg-white border rounded-lg p-6 mb-4 flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className="p-2 bg-[#33022F] rounded-full text-white h-fit">
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 mb-2">
                        Payment Method
                      </h4>
                      {paymentMethod === "cod" ? (
                        <div>
                          <p className="font-bold text-sm text-gray-900">
                            Cash on Delivery
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Pay when you receive your order
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="font-bold text-sm text-gray-900">
                            Pay Online
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Card / UPI / Net Banking / Wallets via Razorpay
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setOpenStep(2)}
                    className="text-[#33022F] font-bold text-xs uppercase hover:underline"
                  >
                    Edit
                  </button>
                </div>

                {/* Delivery Method Review */}
                <div className="bg-white border rounded-lg p-6 mb-4 flex justify-between items-center">
                  <div className="flex gap-4 items-center">
                    <div className="p-2 bg-[#33022F] rounded-full text-white h-fit">
                      <Truck size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">Delivery Method</h4>
                      <p className="font-bold text-sm text-gray-900 mt-1">
                        {selectedShippingMethod.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {selectedShippingMethod.description}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-[#33022F]">
                    {selectedShippingMethod.price === 0
                      ? "FREE"
                      : `₹${selectedShippingMethod.price.toLocaleString()}`}
                  </span>
                </div>

                {/* Terms */}
                <div className="border border-[#F472B6] bg-[#FFF5F9] rounded-lg p-4 flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 text-[#33022F] border-gray-300 rounded focus:ring-[#33022F]"
                  />
                  <div>
                    <p className="text-sm font-bold text-gray-800">
                      I agree to the terms and conditions
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      By placing this order, you agree to our{" "}
                      <Link to="/terms" className="text-blue-600">
                        Terms & Conditions
                      </Link>
                      ,{" "}
                      <Link to="/privacy" className="text-blue-600">
                        Privacy Policy
                      </Link>
                      , and{" "}
                      <Link to="/returns" className="text-blue-600">
                        Return Policy
                      </Link>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setOpenStep(2)}
                  className="text-sm text-gray-500 underline hover:text-[#33022F]"
                >
                  ← Back to Payment
                </button>
              </div>
            )}
          </div>

          {/* ─── RIGHT COLUMN — Order Summary ─── */}
          <div className="lg:col-span-5 xl:col-span-4 relative">
            <div className="sticky top-24">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 mb-6">
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6 border-b border-gray-100 pb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Subtotal ({transformedCartItems.length} items)
                    </span>
                    <span className="font-bold text-gray-900">
                      ₹{displaySubtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-bold text-gray-900">
                      {shippingFee === 0
                        ? "FREE"
                        : `₹${shippingFee.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (18% GST)</span>
                    <span className="font-bold text-gray-900">
                      ₹
                      {displayTax.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-6">
                  <span className="font-bold text-gray-900 text-base">Total</span>
                  <span className="font-bold text-gray-900 text-xl">
                    ₹{displayTotal.toLocaleString()}
                  </span>
                </div>

                {shippingFee === 0 && (
                  <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-xs font-semibold flex items-center gap-2 mb-6">
                    <span className="text-base">🎉</span> You're eligible for FREE
                    shipping!
                  </div>
                )}

                <button
                  onClick={() => {
                    if (openStep === 1) handleProceedToPayment();
                    else if (openStep === 2) handleProceedToReview();
                    else if (openStep === 3) {
                      if (!agreeTerms) {
                        toast.warning("Please agree to the terms and conditions");
                        return;
                      }
                      handlePayNow();
                    }
                  }}
                  disabled={isProcessingPayment}
                  className="w-full bg-[#3D0C2E] text-white h-12 rounded-lg font-bold uppercase tracking-wider hover:bg-[#2a0820] transition shadow-md text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessingPayment ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Processing...
                    </>
                  ) : openStep === 3 ? (
                    paymentMethod === "online" ? "Pay Now" : "Place Order (COD)"
                  ) : openStep === 2 ? (
                    "Review Order"
                  ) : (
                    "Proceed to Payment"
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 mt-4 text-gray-400">
                  <Shield size={12} />
                  <p className="text-[10px]">
                    Secure checkout • 100% safe & encrypted
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
