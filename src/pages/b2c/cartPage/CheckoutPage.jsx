import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
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
  const MAROON = "#800000";

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
    firstName: "",
    lastName: "",
    streetAddress: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    phone: "",
  });

  const [selectedCountryCode, setSelectedCountryCode] = useState("");
  const [selectedStateCode, setSelectedStateCode] = useState("");

  const [openStep, setOpenStep] = useState(1);
  const [step2Unlocked, setStep2Unlocked] = useState(false);
  const [step3Unlocked, setStep3Unlocked] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(null);
  const [email, setEmail] = useState("");

  // Shiprocket State
  const [shippingRates, setShippingRates] = useState([]);
  const [selectedCourier, setSelectedCourier] = useState(null);
  const [loadingRates, setLoadingRates] = useState(false);

  // Fetch shipping rates
  const fetchShippingRates = async (postalCode) => {
    if (!postalCode || postalCode.length !== 6) return;

    setLoadingRates(true);
    setShippingRates([]);
    setSelectedCourier(null);

    try {
      console.log("📦 Fetching shipping rates for:", postalCode);
      const result = await shiprocketService.getShippingRates(
        postalCode,
        transformedCartItems,
        paymentMethod === 'cod'
      );

      if (result.success && result.data?.available_courier_companies) {
        // Filter out couriers with 0 charge if necessary, or just keep all
        const couriers = result.data.available_courier_companies.filter(c => c.freight_charge > 0);
        setShippingRates(couriers);

        // Auto-select cheapest courier
        if (couriers.length > 0) {
          const cheapest = couriers.reduce((prev, curr) =>
            prev.freight_charge < curr.freight_charge ? prev : curr
          );
          setSelectedCourier(cheapest);
        }
      } else {
        console.warn("⚠️ No shipping rates found:", result);
      }
    } catch (error) {
      console.error("❌ Failed to fetch shipping rates:", error);
    } finally {
      setLoadingRates(false);
    }
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
      const currentUser = auth.currentUser;
      console.log("👤 CHECKOUT - Current User:", currentUser?.email || "No user");

      if (currentUser) {
        try {
          const firebaseEmail = currentUser.email || "";
          try {
            const userData = await B2BAuthService.getUserById(currentUser.uid);
            console.log("👤 CHECKOUT - User Data:", userData?.data);

            if (userData?.data) {
              const addressesResponse = await B2BAddressService.getAddresses(
                currentUser.uid,
                userData.data.role || "B2C"
              );
              console.log("📬 CHECKOUT - Addresses Response:", addressesResponse);

              const addresses = addressesResponse.success ? addressesResponse.data : [];
              console.log("🏠 CHECKOUT - All Addresses:", addresses);
              console.log("🏠 CHECKOUT - Number of addresses:", addresses.length);

              setUserDetails({
                id: currentUser.uid,
                email: userData.data.email || firebaseEmail,
                role: userData.data.role || "B2C",
                isLoggedIn: true,
                addresses,
              });
            } else {
              console.log("⚠️ CHECKOUT - No user data found");
              setUserDetails({
                id: currentUser.uid,
                email: firebaseEmail,
                role: "B2C",
                isLoggedIn: true,
                addresses: [],
              });
            }
          } catch (b2bError) {
            console.error("❌ CHECKOUT - B2B Service Error:", b2bError);
            setUserDetails({
              id: currentUser.uid,
              email: firebaseEmail,
              role: "B2C",
              isLoggedIn: true,
              addresses: [],
            });
          }
        } catch (error) {
          console.error("❌ CHECKOUT - General Error:", error);
          setUserDetails({
            id: currentUser.uid,
            email: currentUser.email || "",
            role: "B2C",
            isLoggedIn: true,
            addresses: [],
          });
        }
      } else {
        console.log("👤 CHECKOUT - No user logged in");
        setUserDetails({
          id: null,
          email: "",
          role: null,
          isLoggedIn: false,
          addresses: [],
        });
      }
    };
    fetchUserDetails();
    const unsub = auth.onAuthStateChanged(fetchUserDetails);
    return () => unsub();
  }, []);

  useEffect(() => {
    if (userDetails.isLoggedIn && userDetails.addresses.length > 0) {
      const defaultAddr = userDetails.addresses.find((a) => a.isDefault);
      if (defaultAddr && !defaultAddress) {
        setDefaultAddress(defaultAddr);
        setSelectedAddress(defaultAddr);

        setShippingForm({
          firstName: defaultAddr.firstName || "",
          lastName: defaultAddr.lastName || "",
          streetAddress: defaultAddr.address || "",
          city: defaultAddr.city || "",
          state: defaultAddr.stateProvince || "",
          postalCode: defaultAddr.zipPostalCode || "",
          country: defaultAddr.country || "India",
          phone: defaultAddr.phone || "",
        });

        const countryObj = Country.getAllCountries().find((c) => c.name === defaultAddr.country);
        if (countryObj) {
          setSelectedCountryCode(countryObj.isoCode);

          setTimeout(() => {
            const stateObj = State.getStatesOfCountry(countryObj.isoCode).find(
              (s) => s.name === defaultAddr.stateProvince
            );
            if (stateObj) {
              setSelectedStateCode(stateObj.isoCode);
            }
          }, 50);
        }

        setStep2Unlocked(true);
        setStep3Unlocked(true);
        setOpenStep(3);
      }
    }
  }, [userDetails.addresses, userDetails.isLoggedIn]);

  useEffect(() => {
    if (userDetails.addresses.length > 0) {
      const latestDefault = userDetails.addresses.find((a) => a.isDefault);
      if (latestDefault && defaultAddress?.id !== latestDefault.id) {
        setDefaultAddress(latestDefault);
        setSelectedAddress(latestDefault);
      }
    }
  }, [userDetails.addresses, defaultAddress?.id]);

  useEffect(() => {
    if (userDetails.isLoggedIn && userDetails.email) {
      setEmail(userDetails.email);
      setStep2Unlocked(true);
      if (openStep === 1) setOpenStep(2);
    } else if (userDetails.isLoggedIn && !userDetails.email) {
      setStep2Unlocked(false);
      setOpenStep(1);
    }
  }, [userDetails]);

  useEffect(() => {
    let unsubscribe;
    const loadCart = async () => {
      if (location.state?.cartItems?.length > 0) {
        const transformed = transformCartData(location.state.cartItems);
        setCartItems(location.state.cartItems);
        setTransformedCartItems(transformed);
        setIsLoading(false);
        return;
      }
      if (userDetails.isLoggedIn) {
        unsubscribe = await cartService.subscribeToCart((data) => {
          const transformed = transformCartData(data || []);
          setCartItems(data || []);
          setTransformedCartItems(transformed);
          setIsLoading(false);
        });
      } else {
        const guest = JSON.parse(sessionStorage.getItem("guest_cart") || "[]");
        const transformed = transformCartData(guest);
        setCartItems(guest);
        setTransformedCartItems(transformed);
        setIsLoading(false);
      }
    };
    loadCart();
    return () => unsubscribe?.();
  }, [location.state, userDetails.isLoggedIn]);

  const openRequestedStep = (n) => {
    if (n === 1) return setOpenStep(1);
    if (n === 2 && step2Unlocked) return setOpenStep(2);
    if (n === 3 && step3Unlocked) return setOpenStep(3);
    alert(`Please complete Step ${n - 1} first.`);
  };

  const handleCheckoutAsGuest = () => {
    const emailRegex = /^[A-Za-z][A-Za-z0-9._%+-]*@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!email || !emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }
    if (userDetails.isLoggedIn) {
      setUserDetails((prev) => ({ ...prev, email }));
    }
    setStep2Unlocked(true);
    setOpenStep(2);
  };

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProceedToPayment = async () => {
    if (userDetails.role === "B2B" && defaultAddress) {
      if (defaultAddress.zipPostalCode) {
        await fetchShippingRates(defaultAddress.zipPostalCode);
      }
      setStep3Unlocked(true);
      setOpenStep(3);
      return;
    }

    const { firstName, lastName, streetAddress, city, state, postalCode, country, phone } =
      shippingForm;
    if (
      !firstName ||
      !lastName ||
      !streetAddress ||
      !city ||
      !state ||
      !postalCode ||
      !country ||
      !phone
    ) {
      alert("Please fill all shipping fields.");
      return;
    }
    if (!/^[A-Za-z\s]+$/.test(firstName) || !/^[A-Za-z\s]+$/.test(lastName)) {
      alert("Name must contain only letters.");
      return;
    }
    if (!/^\d{6}$/.test(postalCode)) {
      alert("Postal code must be exactly 6 digits.");
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      alert("Phone must be exactly 10 digits.");
      return;
    }
    await fetchShippingRates(postalCode);
    setStep3Unlocked(true);
    setOpenStep(3);
  };

  const subtotal = transformedCartItems.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );
  const discount = couponApplied?.amount || subtotal * 0.12;
  const shippingFee = selectedCourier?.freight_charge || 0;
  const totalPayable = Math.max(0, subtotal - discount + shippingFee);

  const handlePayNow = async () => {
    if (!step3Unlocked) return alert("Complete previous steps.");

    setIsProcessingPayment(true);

    const finalEmail = userDetails.isLoggedIn && userDetails.email ? userDetails.email : email;

    if (!finalEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(finalEmail)) {
      alert("Valid email is required.");
      setOpenStep(1);
      setStep2Unlocked(false);
      setStep3Unlocked(false);
      setIsProcessingPayment(false);
      return;
    }


    if (paymentMethod === "cod") {
      try {
        setIsLoading(true);

        // ✨ ATOMIC OPERATION: Create order and clear cart together
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

        // 🚀 Shiprocket Order Creation (COD)
        try {
          const shiprocketResult = await shiprocketService.createOrder({
            orderId: orderResult.orderId,
            email: finalEmail,
            shipping: shippingForm,
            products: transformedCartItems,
            paymentMethod: "cod",
            shippingFee: shippingFee,
            discount: discount,
            amount: totalPayable,
            weight: 0.5,
            courierId: selectedCourier?.courier_company_id
          });

          if (shiprocketResult.success && shiprocketResult.data) {
            await orderService.updateShipmentData(orderResult.orderId, shiprocketResult.data);
            console.log('✅ Shiprocket order created successfully');
          }
        } catch (shipError) {
          console.error("❌ Shiprocket order creation failed:", shipError);
        }

        // Clear guest cart if not logged in
        if (!userDetails.isLoggedIn) {
          sessionStorage.removeItem("guest_cart");
        }

        navigate("/order-success", { state: { orderId: orderResult.orderId, paymentMethod: "COD" } });
      } catch (err) {
        alert("COD order failed. Please try again.");
        setIsLoading(false);
      } finally {
        setIsProcessingPayment(false);
      }
      return;
    }

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
        name: "DVYB",
        description: "Order Payment",
        order_id: order.id,
        handler: async (response) => {
          try {
            setIsLoading(true); // Hide checkout UI immediately
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
              // ✨ ATOMIC OPERATION: Create order and clear cart together
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

              // 🚀 Shiprocket Order Creation (Prepaid)
              try {
                const shiprocketResult = await shiprocketService.createOrder({
                  orderId: orderResult.orderId,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  email: finalEmail,
                  shipping: shippingForm,
                  products: transformedCartItems,
                  paymentMethod: paymentMethod,
                  shippingFee: shippingFee,
                  discount: discount,
                  amount: totalPayable,
                  weight: 0.5,
                  courierId: selectedCourier?.courier_company_id
                });

                if (shiprocketResult.success && shiprocketResult.data) {
                  await orderService.updateShipmentData(orderResult.orderId, shiprocketResult.data);
                  console.log('✅ Shiprocket prepaid order created successfully');
                }
              } catch (shipError) {
                console.error("❌ Shiprocket prepaid order failed:", shipError);
              }

              // Clear guest cart if not logged in
              if (!userDetails.isLoggedIn) {
                sessionStorage.removeItem("guest_cart");
              }

              navigate("/order-success", { state: { orderId: orderResult.orderId, paymentMethod: "ONLINE" } });
            } else {
              alert("Payment failed. Please try again.");
              setIsLoading(false);
            }
          } catch (err) {
            alert("Payment verification failed.");
            setIsLoading(false);
          } finally {
            setIsProcessingPayment(false);
          }
        },
        prefill: {
          name: `${shippingForm.firstName} ${shippingForm.lastName}`.trim() || "Customer",
          email: finalEmail,
          contact: shippingForm.phone || "",
        },
        theme: { color: "#800000" },
        modal: { ondismiss: () => setIsProcessingPayment(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => {
        alert("Payment failed or cancelled.");
        setIsProcessingPayment(false);
      });
      rzp.open();
    } catch (err) {
      alert("Payment failed to start.");
      setIsProcessingPayment(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading checkout...</div>;
  }

  return (
    <div className="min-h-screen bg-white font-[Outfit] pb-20">

      {/* Top Progress Bar - Exact Replication of Image 2 */}
      <div className="w-full bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">

            {/* Shipping Step */}
            <div className="flex flex-col items-center justify-center h-full relative cursor-pointer min-w-[100px]" onClick={() => openStep > 1 && openRequestedStep(1)}>
              <span className={`text-sm font-bold uppercase tracking-wide mb-1 ${openStep >= 1 ? 'text-[#800000]' : 'text-gray-400'}`}>Shipping</span>
              {openStep >= 1 && (
                <div className="absolute bottom-0 left-0 w-full h-[4px] bg-[#800000] rounded-t-sm"></div>
              )}
            </div>

            {/* Payment Step */}
            <div className="flex flex-col items-center justify-center h-full relative cursor-pointer min-w-[100px]" onClick={() => openStep > 2 && openRequestedStep(3)}>
              <span className={`text-sm font-bold uppercase tracking-wide mb-1 ${openStep >= 3 ? 'text-[#800000]' : 'text-gray-400'}`}>Payment</span>
              {openStep >= 3 && (
                <div className="absolute bottom-0 left-0 w-full h-[4px] bg-[#800000] rounded-t-sm"></div>
              )}
            </div>

            {/* Review Step (Visual Placeholder) */}
            <div className="flex flex-col items-center justify-center h-full relative min-w-[100px]">
              <span className="text-sm font-bold uppercase tracking-wide mb-1 text-gray-400">Review</span>
            </div>

            {/* Confirmation Step (Visual Placeholder) */}
            <div className="flex flex-col items-center justify-center h-full relative min-w-[100px]">
              <span className="text-sm font-bold uppercase tracking-wide mb-1 text-gray-400">Confirmation</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Left Column: Forms - 8 Cols */}
          <div className="lg:col-span-8 space-y-10">

            {/* Step 1: Email (Preserving Logic but wrapping in new card style if needed, or keeping hidden if logged in/valid) */}
            {(!userDetails.isLoggedIn || !userDetails.email || openStep === 1) && (
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 font-[Outfit]">Your Email</h2>
                <div className="max-w-md">
                  <p className="text-gray-600 mb-4 text-sm">Enter your email to continue checkout.</p>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full h-12 px-4 border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#800000] focus:border-[#800000] transition-colors outline-none text-gray-900 placeholder-gray-400"
                  />
                  <button
                    onClick={handleCheckoutAsGuest}
                    className="mt-4 bg-[#800000] text-white px-8 py-3 rounded-lg font-bold uppercase tracking-wide hover:bg-[#600000] transition text-sm"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Shipping Information Form - Strict "Image 2" Style */}
            <div className={`transition-opacity duration-300 ${openStep === 2 ? 'block opacity-100' : 'hidden opacity-0'}`}>
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-bold text-gray-900">Shipping Information</h2>
                  {userDetails.isLoggedIn && (
                    <span className="text-sm text-gray-500">Logged in as {userDetails.email}</span>
                  )}
                </div>

                {/* 2-Column Grid Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">

                  {/* Full Name (Combined Logic / Split UI if needed, sticking to Request "Full Name *" as one field mostly, but logic splits. I will render two side-by-side to act as "Full Name" line) */}
                  <div className="md:col-span-2 grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">First Name *</label>
                      <input
                        name="firstName"
                        value={shippingForm.firstName}
                        onChange={handleShippingChange}
                        placeholder="Enter first name"
                        className="w-full h-12 px-4 border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#800000] focus:border-[#800000] transition-colors outline-none text-gray-900 placeholder-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Last Name *</label>
                      <input
                        name="lastName"
                        value={shippingForm.lastName}
                        onChange={handleShippingChange}
                        placeholder="Enter last name"
                        className="w-full h-12 px-4 border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#800000] focus:border-[#800000] transition-colors outline-none text-gray-900 placeholder-gray-400"
                      />
                    </div>
                  </div>

                  {/* Email (Readonly) */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-600 mb-2">Email Address *</label>
                    <input
                      value={userDetails.email || email}
                      readOnly
                      className="w-full h-12 px-4 border border-gray-200 bg-gray-50 rounded-lg text-gray-500 outline-none"
                    />
                  </div>

                  {/* Phone */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-600 mb-2">Phone Number *</label>
                    <input
                      name="phone"
                      value={shippingForm.phone}
                      onChange={handleShippingChange}
                      placeholder="+91 98765 43210"
                      maxLength={10}
                      className="w-full h-12 px-4 border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#800000] focus:border-[#800000] transition-colors outline-none text-gray-900 placeholder-gray-400"
                    />
                  </div>

                  {/* Address Line 1 */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-600 mb-2">Address Line 1 *</label>
                    <input
                      name="streetAddress"
                      value={shippingForm.streetAddress}
                      onChange={handleShippingChange}
                      placeholder="Street address"
                      className="w-full h-12 px-4 border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#800000] focus:border-[#800000] transition-colors outline-none text-gray-900 placeholder-gray-400"
                    />
                  </div>

                  {/* Address Line 2 */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-600 mb-2">Address Line 2</label>
                    <input
                      placeholder="Apartment, suite, etc. (optional)"
                      className="w-full h-12 px-4 border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#800000] focus:border-[#800000] transition-colors outline-none text-gray-900 placeholder-gray-400"
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">City *</label>
                    <select
                      value={shippingForm.city}
                      onChange={(e) =>
                        setShippingForm((prev) => ({ ...prev, city: e.target.value }))
                      }
                      disabled={!selectedStateCode}
                      className="w-full h-12 px-4 border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#800000] focus:border-[#800000] transition-colors outline-none text-gray-900 bg-white disabled:bg-gray-50"
                    >
                      <option value="">Select City</option>
                      {selectedStateCode &&
                        City.getCitiesOfState(selectedCountryCode, selectedStateCode).map((c) => (
                          <option key={c.name} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">State *</label>
                    <select
                      value={selectedStateCode}
                      onChange={(e) => {
                        const code = e.target.value;
                        setSelectedStateCode(code);
                        const state = State.getStateByCodeAndCountry(code, selectedCountryCode);
                        setShippingForm((prev) => ({
                          ...prev,
                          state: state?.name || "",
                          city: "",
                        }));
                      }}
                      disabled={!selectedCountryCode}
                      className="w-full h-12 px-4 border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#800000] focus:border-[#800000] transition-colors outline-none text-gray-900 bg-white disabled:bg-gray-50"
                    >
                      <option value="">Select State</option>
                      {selectedCountryCode &&
                        State.getStatesOfCountry(selectedCountryCode).map((s) => (
                          <option key={s.isoCode} value={s.isoCode}>
                            {s.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* ZIP Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">ZIP Code *</label>
                    <input
                      name="postalCode"
                      value={shippingForm.postalCode}
                      onChange={handleShippingChange}
                      placeholder="110001"
                      maxLength={6}
                      className="w-full h-12 px-4 border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#800000] focus:border-[#800000] transition-colors outline-none text-gray-900 placeholder-gray-400"
                    />
                  </div>

                  {/* Country - Fixed as requested or searchable */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Country *</label>
                    <select
                      value={selectedCountryCode}
                      onChange={(e) => {
                        const code = e.target.value;
                        setSelectedCountryCode(code);
                        const country = Country.getCountryByCode(code);
                        setShippingForm((prev) => ({
                          ...prev,
                          country: country?.name || "",
                          state: "",
                          city: "",
                        }));
                        setSelectedStateCode("");
                      }}
                      className="w-full h-12 px-4 border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#800000] focus:border-[#800000] transition-colors outline-none text-gray-900 bg-white"
                    >
                      <option value="">Select Country</option>
                      {Country.getAllCountries().map((c) => (
                        <option key={c.isoCode} value={c.isoCode}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Payment & Shipping Selection - Strict Cards Style */}
            <div className={`transition-opacity duration-300 ${openStep === 3 ? 'block opacity-100' : 'hidden opacity-0'}`}>
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-bold text-gray-900">Shipping Method</h2>
                  <button onClick={() => openRequestedStep(2)} className="text-sm font-medium text-[#800000] underline">Change Address</button>
                </div>

                {/* Shipping Partners Cards */}
                <div className="space-y-4 mb-10">
                  {!loadingRates && shippingRates.length === 0 && (
                    <div className="p-4 border border-red-100 bg-red-50 rounded-lg text-red-600 text-sm">
                      Please verify your address to see shipping methods.
                    </div>
                  )}
                  {loadingRates && (
                    <div className="text-gray-500 text-sm py-4">Calculating best rates...</div>
                  )}
                  {shippingRates.map((courier) => {
                    const isSelected = selectedCourier?.courier_company_id === courier.courier_company_id;
                    return (
                      <div
                        key={courier.courier_company_id}
                        onClick={() => setSelectedCourier(courier)}
                        className={`relative flex items-center justify-between p-6 rounded-xl border transition-all cursor-pointer ${isSelected
                            ? 'border-[#800000] bg-[#800000]/5 ring-1 ring-[#800000]'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                          }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'border-[#800000]' : 'border-gray-400'}`}>
                            {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#800000]"></div>}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-base">{courier.courier_name}</p>
                            <p className="text-sm text-gray-500 mt-0.5">{courier.etd || 'Standard Delivery'}</p>
                          </div>
                        </div>
                        <p className="font-bold text-gray-900 text-base">
                          {courier.freight_charge === 0 ? 'FREE' : `₹${courier.freight_charge}`}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Method</h2>
                <div className="space-y-4">
                  {["cod", "card", "netbank", "upi"].map((method) => {
                    const isSelected = paymentMethod === method;
                    return (
                      <div
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        className={`relative flex items-center justify-between p-6 rounded-xl border transition-all cursor-pointer ${isSelected
                            ? 'border-[#800000] bg-[#800000]/5 ring-1 ring-[#800000]'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                          }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'border-[#800000]' : 'border-gray-400'}`}>
                            {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#800000]"></div>}
                          </div>
                          <span className="font-bold text-gray-900 uppercase tracking-wide text-sm">
                            {method === 'cod' ? 'Cash on Delivery' : method === 'card' ? 'Credit / Debit Card' : method === 'netbank' ? 'Net Banking' : 'UPI Payment'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            </div>

          </div>

          {/* Right Column: Order Summary - 4 Cols */}
          <div className="lg:col-span-4 relative">
            <div className="sticky top-24">

              {/* Summary Card */}
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-6 font-[Outfit] border-b border-gray-100 pb-4">Order Summary</h3>

                {/* Promo Code Input (Visual match) */}
                <div className="flex gap-2 mb-8">
                  <input
                    placeholder="Enter code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 h-10 px-3 border border-gray-200 rounded-md text-sm outline-none focus:border-gray-400"
                  />
                  <button className="bg-[#3D0C2E] text-white px-5 h-10 rounded-md text-sm font-medium hover:bg-[#2a0820] transition">
                    Apply
                  </button>
                </div>

                {/* Pricing */}
                <div className="space-y-4 mb-6 text-sm">
                  <div className="flex justify-between items-center text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-bold text-gray-900">₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-600">
                    <span>Shipping</span>
                    <span className="font-bold text-gray-900">
                      {shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-gray-600">
                    <span>Tax (18% GST)</span>
                    <span className="font-bold text-gray-900">₹{(subtotal * 0.18).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between items-center text-green-700">
                      <span>Discount</span>
                      <span className="font-bold">- ₹{discount.toFixed(0)}</span>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="flex justify-between items-end border-t border-gray-100 pt-6 mb-8">
                  <span className="font-bold text-gray-900 text-base">Total</span>
                  <span className="font-bold text-gray-900 text-2xl font-[Outfit]">₹{(totalPayable + (subtotal * 0.18)).toLocaleString()}</span>
                </div>

                {/* Eligibility Banner from Ref */}
                <div className="bg-blue-50 text-blue-700 p-3 rounded-md text-xs font-semibold flex items-center gap-2 mb-6">
                  <span>🎉</span> You're eligible for FREE shipping!
                </div>

                {/* Action Button */}
                <button
                  onClick={() => openStep === 2 ? handleProceedToPayment() : handlePayNow()}
                  disabled={isProcessingPayment}
                  className="w-full bg-[#3D0C2E] text-white h-12 rounded-lg font-bold uppercase tracking-wider hover:bg-[#2a0820] transition shadow-md disabled:bg-gray-400"
                >
                  {isProcessingPayment ? 'Processing...' : (openStep === 2 ? 'Proceed to Checkout' : 'Complete Order')}
                </button>

                <p className="text-xs text-center text-gray-400 mt-4">Estimated delivery: 5-7 business days</p>
              </div>

              {/* Items in Cart Card (Separate below Summary) */}
              <div className="mt-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6">Items</h3>
                <div className="space-y-6">
                  {transformedCartItems.map((item, i) => (
                    <div key={i} className="flex gap-4 pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-20 object-cover rounded-md flex-shrink-0 bg-gray-50"
                      />
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <p className="font-bold text-gray-900 text-sm line-clamp-2 leading-snug">{item.name}</p>
                          <p className="text-xs text-gray-500 mt-1">{item.color} | Size: {item.size}</p>
                        </div>
                        <div className="flex justify-between items-end mt-2">
                          <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                          <span className="font-bold text-gray-900 text-sm">₹{((item.price || 0) * (item.quantity || 1)).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
