import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Check, ChevronRight, CreditCard, Wallet, Smartphone, Banknote, Circle, CircleCheck, MapPin, Truck, Edit2 } from "lucide-react";
import { Country, State, City } from "country-state-city";
import { httpsCallable } from "firebase/functions";
import { auth, functions } from "../../../config";
import { cartService } from "../../../services/cartService";
import orderService from "../../../services/orderService";
import B2BAuthService from "../../../services/b2bAuthService";
import B2BAddressService from "../../../services/b2bAddressService";
import shiprocketService from "../../../services/shiprocketService";
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const transformCartData = (cartItems) => {
  const transformed = [];
  cartItems.forEach((item) => {
    if (item.variants && Array.isArray(item.variants) && item.variants.length > 0) {
      item.variants.forEach((variant) => {
        transformed.push({
          id: item.productId || item.id,
          productId: item.productId || item.id,
          name: item.name,
          price: item.price || 0,
          image: item.imageUrls?.[0] || item.image || "/placeholder.jpg",
          color: variant.color || "Default",
          size: variant.size || "M",
          quantity: variant.quantity || 1,
          isB2BVariant: true,
          variant: variant,
        });
      });
    } else {
      transformed.push({
        id: item.productId || item.id,
        productId: item.productId || item.id,
        name: item.name,
        price: item.price || 0,
        image: item.imageUrls?.[0] || item.image || "/placeholder.jpg",
        color: item.color || "Default",
        size: item.size || "M",
        quantity: item.quantity || 1,
        isB2BVariant: false,
      });
    }
  });
  return transformed;
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Theme Colors
  const THEME_PURPLE = "#33022F";
  const THEME_PURPLE_DARK = "#2A0820";

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [defaultAddress, setDefaultAddress] = useState(null);

  const [userDetails, setUserDetails] = useState({
    id: null,
    email: "",
    role: null,
    isLoggedIn: false,
    addresses: [],
  });

  const [cartItems, setCartItems] = useState([]);
  const [transformedCartItems, setTransformedCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [shippingForm, setShippingForm] = useState({
    fullName: "",
    firstName: "",
    lastName: "",
    streetAddress: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    phone: "",
  });

  const [selectedCountryCode, setSelectedCountryCode] = useState("IN");
  const [selectedStateCode, setSelectedStateCode] = useState("");

  const [openStep, setOpenStep] = useState(1); // 1: Shipping, 2: Payment, 3: Review
  const [paymentMethod, setPaymentMethod] = useState("card"); // 'card', 'wallet', 'upi', 'cod'
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(null);
  const [email, setEmail] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState({}); // New Error State

  // Static Shipping Methods
  const shippingMethods = [
    { id: 'standard', name: 'Standard Shipping', description: '5-7 business days', price: 0 },
    { id: 'express', name: 'Express Shipping', description: '2-3 business days', price: 1500 },
    { id: 'nextday', name: '1 business day', price: 3000 },
  ];
  const [selectedShippingMethod, setSelectedShippingMethod] = useState(shippingMethods[0]);


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
            });
          } else {
            setUserDetails({
              id: currentUser.uid,
              email: currentUser.email,
              role: "B2C",
              isLoggedIn: true,
              addresses: [],
            });
          }
        } catch (error) {
          console.error("Error fetching user details:", error);
          setUserDetails({
            id: currentUser.uid,
            email: currentUser.email,
            role: "B2C",
            isLoggedIn: true,
            addresses: [],
          });
        }
      }
    };
    fetchUserDetails();
    const unsub = auth.onAuthStateChanged(fetchUserDetails);
    return () => unsub();
  }, []);

  useEffect(() => {
    // Pre-fill address if logged in
    if (userDetails.isLoggedIn && userDetails.addresses.length > 0) {
      const defaultAddr = userDetails.addresses.find((a) => a.isDefault);
      if (defaultAddr && !defaultAddress) {
        setDefaultAddress(defaultAddr);
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

  useEffect(() => {
    const loadCart = async () => {
      if (location.state?.cartItems?.length > 0) {
        setCartItems(location.state.cartItems);
        setTransformedCartItems(transformCartData(location.state.cartItems));
        setIsLoading(false);
      } else {
        const guest = JSON.parse(sessionStorage.getItem("guest_cart") || "[]");
        setCartItems(guest);
        setTransformedCartItems(transformCartData(guest));
        setIsLoading(false);
      }
    };
    loadCart();
  }, [location.state]);


  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingForm((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleProceedToPayment = () => {
    // Validation
    const newErrors = {};
    if (!shippingForm.fullName?.trim()) newErrors.fullName = "Full name is required";
    if (!userDetails.email && !email?.trim()) newErrors.email = "Email is required";
    if (!shippingForm.phone?.trim()) newErrors.phone = "Phone number is required";
    if (!shippingForm.streetAddress?.trim()) newErrors.streetAddress = "Address is required";
    if (!shippingForm.city?.trim()) newErrors.city = "City is required";
    if (!shippingForm.state?.trim()) newErrors.state = "State is required";
    if (!shippingForm.postalCode?.trim()) newErrors.postalCode = "ZIP Code is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo(0, 0); // Scroll to top to see errors
      return;
    }

    // Split Name if needed for backend compatibility
    if (shippingForm.fullName && (!shippingForm.firstName || !shippingForm.lastName)) {
      const names = shippingForm.fullName.trim().split(" ");
      const firstName = names[0];
      const lastName = names.slice(1).join(" ") || "."; // Fallback to dot if single name
      setShippingForm(prev => ({ ...prev, firstName, lastName }));
    }

    setOpenStep(2);
    window.scrollTo(0, 0);
    setOpenStep(2);
    window.scrollTo(0, 0);
  };

  const handleProceedToReview = () => {
    setOpenStep(3);
    window.scrollTo(0, 0);
  };

  const handlePayNow = async () => {
    setIsProcessingPayment(true);
    const finalEmail = userDetails.email || email;
    const totalPayable = total; // Calculated below

    if (!finalEmail) {
      alert("Email is required.");
      setIsProcessingPayment(false);
      return;
    }

    // Logic adapted from previous implementation
    if (paymentMethod === "cod") {
      try {
        const orderResult = userDetails.isLoggedIn
          ? await orderService.moveCartToOrder({
            products: transformedCartItems,
            paymentMethod: "cod",
            shipping: shippingForm,
            amount: totalPayable,
            status: "Active",
            email: finalEmail,
            userId: userDetails.id || null,
            userRole: userDetails.role || "B2C",
          }, cartItems)
          : await orderService.createOrder({
            products: transformedCartItems,
            paymentMethod: "cod",
            shipping: shippingForm,
            amount: totalPayable,
            status: "Active",
            email: finalEmail,
            userId: userDetails.id || null,
            userRole: userDetails.role || "B2C",
          });

        // Shiprocket Logic (Simplified for static shipping method)
        // In real implementation, you'd integrate the Shiprocket API here passing selectedShippingMethod details

        // Clear cart after successful order
        if (userDetails.isLoggedIn) {
          // Clear Firebase cart for logged-in users
          await cartService.clearCart();
        } else {
          // Clear session storage for guest users
          sessionStorage.removeItem("guest_cart");
        }

        navigate("/order-success", {
          state: {
            orderId: orderResult.orderId,
            paymentMethod: "COD",
            items: transformedCartItems,
            shipping: shippingForm,
            total: totalPayable,
            email: finalEmail
          }
        });
      } catch (err) {
        console.error(err);
        alert("Order failed. Please try again.");
      } finally {
        setIsProcessingPayment(false);
      }
    } else {
      // Razorpay Logic
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert("Failed to load payment gateway.");
        setIsProcessingPayment(false);
        return;
      }

      try {
        const createOrder = httpsCallable(functions, "createRazorpayOrder");
        const { data } = await createOrder({ amount: Math.round(totalPayable) });
        const order = data.order;

        const options = {
          key: RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: "INR",
          name: "VILLY",
          description: "Order Payment",
          order_id: order.id,
          handler: async (response) => {
            try {
              const verify = httpsCallable(functions, "verifyRazorpayPayment");
              const result = await verify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderData: {
                  products: transformedCartItems,
                  shipping: shippingForm,
                  amount: totalPayable,
                  email: finalEmail,
                  paymentMethod,
                  userId: userDetails.id || null,
                  userRole: userDetails.role || "B2C",
                },
              });

              if (result.data.success) {
                const orderResult = userDetails.isLoggedIn
                  ? await orderService.moveCartToOrder({
                    products: transformedCartItems,
                    paymentMethod,
                    shipping: shippingForm,
                    amount: totalPayable,
                    status: "Active",
                    razorpayOrderId: response.razorpay_order_id,
                    razorpayPaymentId: response.razorpay_payment_id,
                    email: finalEmail,
                    userId: userDetails.id || null,
                    userRole: userDetails.role || "B2C",
                  }, cartItems)
                  : await orderService.createOrder({
                    products: transformedCartItems,
                    paymentMethod,
                    shipping: shippingForm,
                    amount: totalPayable,
                    status: "Active",
                    razorpayOrderId: response.razorpay_order_id,
                    razorpayPaymentId: response.razorpay_payment_id,
                    email: finalEmail,
                    userId: userDetails.id || null,
                    userRole: userDetails.role || "B2C",
                  });

                // Clear cart after successful order
                if (userDetails.isLoggedIn) {
                  // Clear Firebase cart for logged-in users
                  await cartService.clearCart();
                } else {
                  // Clear session storage for guest users
                  sessionStorage.removeItem("guest_cart");
                }

                navigate("/order-success", {
                  state: {
                    orderId: orderResult.orderId,
                    paymentMethod: "ONLINE",
                    items: transformedCartItems,
                    shipping: shippingForm,
                    total: totalPayable,
                    email: finalEmail
                  }
                });
              } else {
                alert("Payment verification failed.");
              }
            } catch (err) {
              console.error(err);
              alert("Payment verification error.");
            }
          },
          prefill: {
            name: shippingForm.fullName || "Customer",
            email: finalEmail,
            contact: shippingForm.phone || "",
          },
          theme: { color: THEME_PURPLE },
          modal: { ondismiss: () => setIsProcessingPayment(false) },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (err) {
        console.error(err);
        alert("Payment initiation failed.");
        setIsProcessingPayment(false);
      }
    }
  };

  const subtotal = transformedCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingFee = selectedShippingMethod.price;
  const tax = subtotal * 0.18;
  const total = subtotal + shippingFee + tax;

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading checkout...</div>;

  return (
    <div className="min-h-screen bg-white font-[Outfit]">

      {/* Progress Bar */}
      {/* Progress Bar */}
      <div className="w-full pt-6 pb-2">
        <div className="max-w-6xl mx-auto px-4 h-24 flex items-center justify-center gap-2 md:gap-4 overflow-x-auto scrollbar-hide">
          {['Shipping', 'Payment', 'Review', 'Confirmation'].map((step, idx) => {
            const stepNum = idx + 1;
            const isActive = openStep === stepNum;
            const isCompleted = openStep > stepNum;

            return (
              <div key={step} className="flex flex-col items-center cursor-pointer" onClick={() => stepNum < openStep && setOpenStep(stepNum)}>
                <span className={`text-xs md:text-sm font-bold uppercase tracking-wider mb-2 transition-colors duration-300 ${isActive || isCompleted ? 'text-[#33022F]' : 'text-gray-300'}`}>
                  {step}
                </span>
                <div className={`w-16 md:w-32 h-2 rounded-full transition-all duration-300 ${isActive || isCompleted ? 'bg-[#33022F]' : 'bg-gray-200'}`}></div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* LEFT COLUMN */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-10">

            {openStep === 1 && (
              <>
                <Link to="/cart" className="flex items-center text-gray-500 text-sm font-medium hover:text-[#33022F] mb-6">
                  ← Back to Cart
                </Link>

                <h1 className="text-2xl font-bold text-gray-900 mb-6 font-[Outfit]">Shipping Information</h1>

                {/* Form */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Full Name *</label>
                    <input
                      name="fullName"
                      value={shippingForm.fullName}
                      onChange={handleShippingChange}
                      placeholder="Enter your full name"
                      className={`w-full h-12 px-4 border rounded-md outline-none transition ${errors.fullName ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200 focus:border-[#33022F] focus:ring-1 focus:ring-[#33022F]'}`}
                    />
                    {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Email Address *</label>
                      <input
                        value={userDetails.email || email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errors.email) setErrors(prev => ({ ...prev, email: "" }));
                        }}
                        readOnly={!!userDetails.isLoggedIn && !!userDetails.email}
                        placeholder="your@email.com"
                        className={`w-full h-12 px-4 border rounded-md outline-none transition ${errors.email ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200 focus:border-[#33022F] focus:ring-1 focus:ring-[#33022F]'} ${userDetails.isLoggedIn && userDetails.email ? 'bg-gray-50' : ''}`}
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number *</label>
                      <input
                        name="phone"
                        value={shippingForm.phone}
                        onChange={handleShippingChange}
                        placeholder="+91 98765 43210"
                        className={`w-full h-12 px-4 border rounded-md outline-none transition ${errors.phone ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200 focus:border-[#33022F] focus:ring-1 focus:ring-[#33022F]'}`}
                      />
                      {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Address Line 1 *</label>
                    <input
                      name="streetAddress"
                      value={shippingForm.streetAddress}
                      onChange={handleShippingChange}
                      placeholder="Street address"
                      className={`w-full h-12 px-4 border rounded-md outline-none transition ${errors.streetAddress ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200 focus:border-[#33022F] focus:ring-1 focus:ring-[#33022F]'}`}
                    />
                    {errors.streetAddress && <p className="text-red-500 text-xs mt-1">{errors.streetAddress}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Address Line 2</label>
                    <input
                      name="addressLine2"
                      value={shippingForm.addressLine2}
                      onChange={handleShippingChange}
                      placeholder="Apartment, suite, etc. (optional)"
                      className="w-full h-12 px-4 border border-gray-200 rounded-md focus:border-[#33022F] focus:ring-1 focus:ring-[#33022F] outline-none transition"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">City *</label>
                      <input
                        name="city"
                        value={shippingForm.city}
                        onChange={handleShippingChange}
                        placeholder="City"
                        className={`w-full h-12 px-4 border rounded-md outline-none transition ${errors.city ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200 focus:border-[#33022F] focus:ring-1 focus:ring-[#33022F]'}`}
                      />
                      {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">State *</label>
                      <select
                        value={selectedStateCode}
                        onChange={(e) => {
                          setSelectedStateCode(e.target.value);
                          const s = State.getStateByCodeAndCountry(e.target.value, "IN");
                          setShippingForm(prev => ({ ...prev, state: s?.name || "" }));
                          if (errors.state) setErrors(prev => ({ ...prev, state: "" }));
                        }}
                        className={`w-full h-12 px-4 border rounded-md outline-none transition bg-white ${errors.state ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200 focus:border-[#33022F] focus:ring-1 focus:ring-[#33022F]'}`}
                      >
                        <option value="">Select State</option>
                        {State.getStatesOfCountry("IN").map(s => (
                          <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
                        ))}
                      </select>
                      {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">ZIP Code *</label>
                      <input
                        name="postalCode"
                        value={shippingForm.postalCode}
                        onChange={handleShippingChange}
                        placeholder="110001"
                        maxLength={6}
                        className={`w-full h-12 px-4 border rounded-md outline-none transition ${errors.postalCode ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200 focus:border-[#33022F] focus:ring-1 focus:ring-[#33022F]'}`}
                      />
                      {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>}
                    </div>
                  </div>
                </div>

                {/* Shipping Method */}
                <div className="mt-12">
                  <h2 className="text-lg font-bold text-gray-900 mb-6">Shipping Method</h2>
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    {shippingMethods.map((method, idx) => {
                      const isSelected = selectedShippingMethod.id === method.id;
                      return (
                        <div
                          key={method.id}
                          onClick={() => setSelectedShippingMethod(method)}
                          className={`
                                                        relative flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition
                                                        ${idx !== shippingMethods.length - 1 ? 'border-b border-gray-200' : ''}
                                                        ${isSelected ? 'bg-[#33022F]/5' : ''}
                                                    `}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-[#33022F]' : 'border-gray-300'}`}>
                              {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#33022F]"></div>}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-sm md:text-base">{method.name}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{method.description}</p>
                            </div>
                          </div>
                          <span className="font-bold text-gray-900">
                            {method.price === 0 ? 'FREE' : `₹${method.price.toLocaleString()}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {openStep === 2 && (
              <div className="space-y-6">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-[#33022F] mb-1">Payment Information</h3>
                  <p className="text-gray-500 text-sm">Select your preferred payment method</p>
                </div>

                {/* Payment Method Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {/* Card */}
                  <div
                    onClick={() => setPaymentMethod("card")}
                    style={{ background: paymentMethod === "card" ? "linear-gradient(180deg, #33022F 0%, #5A0452 100%)" : "" }}
                    className={`p-4 rounded-lg border cursor-pointer relative transition-all ${paymentMethod === "card" ? 'text-white border-[#33022F]' : 'bg-white border-gray-200 text-gray-700 hover:border-[#33022F]'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className={`p-2 rounded-full mb-3 ${paymentMethod === "card" ? 'bg-white/10' : 'bg-gray-100'}`}>
                        <CreditCard size={20} className={paymentMethod === "card" ? "text-white" : "text-gray-600"} />
                      </div>
                      {paymentMethod === "card" && <CircleCheck size={20} className="text-white" />}
                    </div>
                    <h4 className="font-bold text-sm">Credit / Debit Card</h4>
                    <p className={`text-xs mt-1 ${paymentMethod === "card" ? 'text-white/70' : 'text-gray-500'}`}>Visa, Mastercard, Amex, RuPay</p>
                  </div>

                  {/* Wallet */}
                  <div
                    onClick={() => setPaymentMethod("wallet")}
                    style={{ background: paymentMethod === "wallet" ? "linear-gradient(180deg, #33022F 0%, #5A0452 100%)" : "" }}
                    className={`p-4 rounded-lg border cursor-pointer relative transition-all ${paymentMethod === "wallet" ? 'text-white border-[#33022F]' : 'bg-white border-gray-200 text-gray-700 hover:border-[#33022F]'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className={`p-2 rounded-full mb-3 ${paymentMethod === "wallet" ? 'bg-white/10' : 'bg-gray-100'}`}>
                        <Wallet size={20} className={paymentMethod === "wallet" ? "text-white" : "text-gray-600"} />
                      </div>
                      {paymentMethod === "wallet" && <CircleCheck size={20} className="text-white" />}
                    </div>
                    <h4 className="font-bold text-sm">Digital Wallet</h4>
                    <p className={`text-xs mt-1 ${paymentMethod === "wallet" ? 'text-white/70' : 'text-gray-500'}`}>PayPal, Google Pay, Apple Pay</p>
                  </div>

                  {/* UPI */}
                  <div
                    onClick={() => setPaymentMethod("upi")}
                    style={{ background: paymentMethod === "upi" ? "linear-gradient(180deg, #33022F 0%, #5A0452 100%)" : "" }}
                    className={`p-4 rounded-lg border cursor-pointer relative transition-all ${paymentMethod === "upi" ? 'text-white border-[#33022F]' : 'bg-white border-gray-200 text-gray-700 hover:border-[#33022F]'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className={`p-2 rounded-full mb-3 ${paymentMethod === "upi" ? 'bg-white/10' : 'bg-gray-100'}`}>
                        <Smartphone size={20} className={paymentMethod === "upi" ? "text-white" : "text-gray-600"} />
                      </div>
                      {paymentMethod === "upi" && <CircleCheck size={20} className="text-white" />}
                    </div>
                    <h4 className="font-bold text-sm">UPI Payment</h4>
                    <p className={`text-xs mt-1 ${paymentMethod === "upi" ? 'text-white/70' : 'text-gray-500'}`}>PhonePe, Paytm, GPay, BHIM</p>
                  </div>

                  {/* COD */}
                  <div
                    onClick={() => setPaymentMethod("cod")}
                    style={{ background: paymentMethod === "cod" ? "linear-gradient(180deg, #33022F 0%, #5A0452 100%)" : "" }}
                    className={`p-4 rounded-lg border cursor-pointer relative transition-all ${paymentMethod === "cod" ? 'text-white border-[#33022F]' : 'bg-white border-gray-200 text-gray-700 hover:border-[#33022F]'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className={`p-2 rounded-full mb-3 ${paymentMethod === "cod" ? 'bg-white/10' : 'bg-gray-100'}`}>
                        <Banknote size={20} className={paymentMethod === "cod" ? "text-white" : "text-gray-600"} />
                      </div>
                      {paymentMethod === "cod" && <CircleCheck size={20} className="text-white" />}
                    </div>
                    <h4 className="font-bold text-sm">Cash on Delivery</h4>
                    <p className={`text-xs mt-1 ${paymentMethod === "cod" ? 'text-white/70' : 'text-gray-500'}`}>Pay when you receive</p>
                  </div>
                </div>

                {/* Dynamic Content Area */}
                <div className="border border-gray-200 rounded-lg p-6">
                  {paymentMethod === "card" && (
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-[#33022F] rounded-full text-white">
                          <CreditCard size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800">Card Details</h4>
                          <p className="text-xs text-gray-500">Enter your card information</p>
                        </div>
                      </div>
                      {/* Saved Cards Mockup */}
                      <div className="mb-4">
                        <label className="text-sm font-bold text-gray-700 block mb-2">Saved Cards</label>
                        <div className="border rounded-md p-4 flex items-center justify-between mb-3 cursor-pointer hover:border-[#33022F]">
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-black"></div>
                            </div>
                            <div className="w-8 h-5 bg-blue-800 rounded"></div>
                            <span className="font-medium text-sm">Visa •••• 4532</span>
                          </div>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">Default</span>
                        </div>
                        <div className="border rounded-md p-4 flex items-center gap-3 cursor-pointer opacity-70 hover:opacity-100">
                          <div className="w-4 h-4 rounded-full border border-gray-400"></div>
                          <div className="w-8 h-5 bg-red-600 rounded"></div>
                          <span className="font-medium text-sm">Mastercard •••• 8901</span>
                        </div>
                      </div>
                      <div className="border border-[#33022F]/30 bg-[#33022F]/5 rounded-md p-4 flex items-center gap-3 cursor-pointer">
                        <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[#33022F] font-bold text-lg leading-none">+</div>
                        <div>
                          <h5 className="font-bold text-sm text-[#33022F]">Add New Card</h5>
                          <p className="text-xs text-gray-600">Use a different payment card</p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-2 text-green-600">
                        <CircleCheck size={16} fill="currentColor" className="text-white" />
                        <span className="text-xs font-medium">Secure Payment</span>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "wallet" && (
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-[#33022F] rounded-full text-white">
                          <Wallet size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800">Select Wallet</h4>
                          <p className="text-xs text-gray-500">Choose your preferred digital wallet</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {['PayPal', 'Google Pay', 'Apple Pay', 'Amazon Pay'].map((wallet) => (
                          <div key={wallet} className="border rounded-md p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#33022F] hover:bg-gray-50 transition">
                            <div className="h-8 w-full bg-gray-200 rounded animate-pulse"></div>
                            <span className="text-xs font-medium text-gray-700">{wallet}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {paymentMethod === "upi" && (
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-[#33022F] rounded-full text-white">
                          <Smartphone size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800">UPI Payment</h4>
                          <p className="text-xs text-gray-500">Pay using your UPI ID</p>
                        </div>
                      </div>
                      <div className="mb-6">
                        <label className="text-sm font-bold text-gray-700 block mb-2">Enter UPI ID *</label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="username@upi"
                            className="w-full h-12 px-4 border border-gray-200 rounded-md focus:border-[#33022F] focus:ring-1 focus:ring-[#33022F] outline-none"
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <Smartphone size={18} />
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-bold text-gray-700 block mb-2">Popular UPI Apps</label>
                        <div className="grid grid-cols-4 gap-4">
                          {['PhonePe', 'Paytm', 'GPay', 'BHIM'].map((app) => (
                            <div key={app} className="border rounded-full p-2 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-[#33022F] bg-gray-50">
                              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-xs font-bold border">{app[0]}</div>
                              <span className="text-[10px] text-gray-600">{app}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "cod" && (
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-[#33022F] rounded-full text-white">
                          <Banknote size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800">Cash on Delivery</h4>
                          <p className="text-xs text-gray-500">Pay when you receive your order</p>
                        </div>
                      </div>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5">
                        <div className="flex items-start gap-3">
                          <div className="p-1 bg-yellow-400 rounded-full text-white mt-0.5">
                            <Banknote size={16} />
                          </div>
                          <div>
                            <h5 className="font-bold text-sm text-gray-800 mb-2">How COD Works</h5>
                            <ul className="text-xs text-gray-600 space-y-1 list-disc pl-4">
                              <li>Pay directly to our delivery partner in cash</li>
                              <li>Additional ₹50 convenience fee applies (waived for now)</li>
                              <li>Please keep exact change ready</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <button onClick={() => setOpenStep(1)} className="text-sm text-gray-500 underline">Back to Shipping</button>
              </div>
            )}

            {openStep === 3 && (
              <div className="space-y-6">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-[#33022F] mb-1">Review Your Order</h3>
                  <p className="text-gray-500 text-sm">Please review your order details before placing your order</p>
                </div>

                {/* Order Items */}
                <div className="bg-white border rounded-lg p-6 mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-[#33022F]/10 rounded-full text-[#33022F]">
                      <Check size={16} />
                    </div>
                    <h4 className="font-bold text-gray-800">Order Items ({transformedCartItems.length})</h4>
                  </div>
                  <div className="space-y-6">
                    {transformedCartItems.map((item) => (
                      <div key={item.id} className="flex gap-4 border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                        <div className="w-20 h-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-bold text-sm text-gray-900 mb-1">{item.brand?.toUpperCase() || 'BRAND'}</h5>
                          <p className="text-sm text-gray-700 font-medium mb-1">{item.name}</p>
                          <div className="text-xs text-gray-500 mb-2">
                            Quantity: <span className="font-bold text-gray-800">{item.quantity}</span> &bull; Price: <span className="font-bold text-gray-800">₹{item.price.toLocaleString()}</span>
                          </div>
                          <p className="text-xs text-justify text-gray-400">Item Total</p>
                        </div>
                        <div className="flex flex-col justify-end items-end">
                          <span className="font-bold text-lg text-[#33022F]">₹{(item.price * item.quantity).toLocaleString()}</span>
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
                      <h4 className="font-bold text-gray-800 mb-2">Shipping Address</h4>
                      <p className="font-bold text-sm text-gray-900">{shippingForm.fullName}</p>
                      <p className="text-sm text-gray-600 w-3/4 leading-relaxed mt-1">
                        {shippingForm.streetAddress}, {shippingForm.city}, {shippingForm.state} {shippingForm.postalCode}
                      </p>
                      <p className="text-sm text-gray-600 mt-2 font-medium">{shippingForm.phone}</p>
                      <p className="text-sm text-gray-600">{email || userDetails.email}</p>
                    </div>
                  </div>
                  <button onClick={() => setOpenStep(1)} className="text-[#33022F] font-bold text-xs uppercase hover:underline">Edit</button>
                </div>

                {/* Payment Method Review */}
                <div className="bg-white border rounded-lg p-6 mb-4 flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className="p-2 bg-[#33022F] rounded-full text-white h-fit">
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 mb-2">Payment Method</h4>
                      {paymentMethod === "cod" ? (
                        <div>
                          <p className="font-bold text-sm text-gray-900">Cash on Delivery</p>
                          <p className="text-xs text-gray-500 mt-1">Pay when you receive</p>
                          <div className="mt-2 bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs px-2 py-1 rounded inline-block">
                            +₹50 COD fee applies
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="font-bold text-sm text-gray-900">Online Payment</p>
                          <p className="text-xs text-gray-500 mt-1">Card / UPI / Wallet</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <button onClick={() => setOpenStep(2)} className="text-[#33022F] font-bold text-xs uppercase hover:underline">Edit</button>
                </div>

                {/* Delivery Method Review */}
                <div className="bg-white border rounded-lg p-6 mb-4 flex justify-between items-center">
                  <div className="flex gap-4 items-center">
                    <div className="p-2 bg-[#33022F] rounded-full text-white h-fit">
                      <Truck size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">Delivery Method</h4>
                      <p className="font-bold text-sm text-gray-900 mt-1">Standard Shipping</p>
                      <p className="text-xs text-gray-500">Delivery in 5-7 business days</p>
                    </div>
                  </div>
                  <span className="font-bold text-[#33022F]">FREE</span>
                </div>

                {/* Terms Checkbox */}
                <div className="border border-[#F472B6] bg-[#FFF5F9] rounded-lg p-4 flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 text-[#33022F] border-gray-300 rounded focus:ring-[#33022F]"
                  />
                  <div>
                    <p className="text-sm font-bold text-gray-800">I agree to the terms and conditions</p>
                    <p className="text-xs text-gray-600 mt-1">
                      By placing this order, you agree to our <span className="text-blue-600 cursor-pointer">Terms & Conditions</span>, <span className="text-blue-600 cursor-pointer">Privacy Policy</span>, and <span className="text-blue-600 cursor-pointer">Return Policy</span>
                    </p>
                  </div>
                </div>

                <button onClick={() => setOpenStep(2)} className="text-sm text-gray-500 underline">Back to Payment</button>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN - Summary */}
          <div className="lg:col-span-5 xl:col-span-4 relative">
            <div className="sticky top-24">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 mb-6 font-[Outfit]">Order Summary</h2>

                <div className="mb-8">
                  <label className="block text-xs font-bold text-gray-600 mb-2">Promo Code</label>
                  <div className="flex gap-2">
                    <input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Enter code"
                      className="flex-1 h-10 px-3 border border-gray-200 rounded-md text-sm outline-none focus:border-[#33022F]"
                    />
                    <button className="bg-[#3D0C2E] text-white px-6 h-10 rounded-md text-sm font-medium hover:bg-[#2a0820] transition">
                      Apply
                    </button>
                  </div>
                </div>

                <div className="space-y-4 mb-6 border-b border-gray-100 pb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-bold text-gray-900">₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-bold text-gray-900">
                      {shippingFee === 0 ? 'FREE' : `₹${shippingFee.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (18% GST)</span>
                    <span className="font-bold text-gray-900">₹{tax.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-6">
                  <span className="font-bold text-gray-900 text-base">Total</span>
                  <span className="font-bold text-gray-900 text-xl font-[Outfit]">₹{total.toLocaleString()}</span>
                </div>

                <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-xs font-semibold flex items-center gap-2 mb-6">
                  <span className="text-base">🎉</span> You're eligible for FREE shipping!
                </div>

                <button
                  onClick={() => {
                    if (openStep === 1) handleProceedToPayment();
                    else if (openStep === 2) handleProceedToReview();
                    else if (openStep === 3) {
                      if (!agreeTerms) {
                        alert("Please agree to the terms and conditions");
                        return;
                      }
                      handlePayNow();
                    }
                  }}
                  disabled={isProcessingPayment}
                  className={`w-full bg-[#3D0C2E] text-white h-12 rounded-lg font-bold uppercase tracking-wider hover:bg-[#2a0820] transition shadow-md text-sm disabled:opacity-50 flex items-center justify-center gap-2`}
                >
                  {isProcessingPayment ? 'Processing...' : (openStep === 3 ? 'Proceed to Checkout' : (openStep === 2 ? 'Review Order' : 'Proceed to Payment'))}
                </button>

                <p className="text-[10px] text-gray-400 text-center mt-3">Estimated delivery: 5-7 business days</p>

              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
