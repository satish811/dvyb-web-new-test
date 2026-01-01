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
        const orderResult = await orderService.createOrder({
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

        if (userDetails.isLoggedIn) {
          // Fire and forget cart cleanup
          Promise.all(
            cartItems.map((item) => cartService.removeFromCart(item.productId || item.id))
          ).catch((e) => console.error("Background cart cleanup failed", e));
        } else {
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
              const orderResult = await orderService.createOrder({
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

              if (userDetails.isLoggedIn) {
                // Fire and forget, don't await to speed up navigation
                Promise.all(cartItems.map((item) => cartService.removeFromCart(item.productId || item.id))).catch(
                  (err) => console.error("Background cart cleanup error", err)
                );
              } else {
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
    <div className="min-h-screen bg-white font-[Outfit] py-10 lg:py-2">
      <div className="max-w-7xl mx-auto px-9 md:px-10">
        {/* {userDetails.isLoggedIn && (
          <div className="bg-gray-50 border-b border-t p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-primary">Welcome back!</h3>
                <p className="text-sm text-primary">
                  Logged in as: <strong>{userDetails.email}</strong>
                  {userDetails.role && ` (${userDetails.role})`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-grey-800">Faster checkout ✓</p>
                <p className="text-xs text-grey-600">Order history saved</p>
              </div>
            </div>
          </div>
        )} */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            {(!userDetails.isLoggedIn || !userDetails.email || openStep === 1) && (
              <div className="border border-gray-300 rounded-sm overflow-hidden">
                <div
                  className="bg-gray-100 px-5 py-4 flex justify-between items-center cursor-pointer border-l-4"
                  style={{ borderColor: openStep === 1 ? MAROON : "transparent" }}
                  onClick={() => openRequestedStep(1)}
                >
                  <h2 className="font-semibold uppercase">1. User Email</h2>
                  {email && openStep !== 1 && (
                    <span className="text-sm text-gray-600">{email}</span>
                  )}
                  {userDetails.isLoggedIn && !userDetails.email && (
                    <span className="text-sm text-orange-600">Email required for payment</span>
                  )}
                </div>
                {openStep === 1 && (
                  <div className="p-6 grid md:grid-cols-2 gap-8">
                    <div>
                      <p className="text-sm mb-4 ">
                        {userDetails.isLoggedIn
                          ? "Email is required for order confirmation and payment processing"
                          : "Enter your email to continue"}
                      </p>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full border px-4 py-3 rounded-sm focus:ring-2 focus:ring-maroon focus:outline-none"
                        required
                      />
                      <button
                        onClick={handleCheckoutAsGuest}
                        className="bg-primary text-gray-800 w-full mt-4 bg-maroon text-white py-3 uppercase font-medium hover:bg-[#660000]"
                      >
                        {userDetails.isLoggedIn ? "Save Email & Continue" : "Continue as Guest"}
                      </button>
                    </div>
                    <div className="text-sm">
                      {!userDetails.isLoggedIn && (
                        <>
                          <p>Have an account?</p>
                          <Link to="/login" className="text-maroon font-bold">
                            Log in for faster checkout →
                          </Link>
                        </>
                      )}
                      {userDetails.isLoggedIn && (
                        <div className="space-y-2">
                          <p className="text-green-600">
                            ✓ You're logged in. Just need your email for order confirmation.
                          </p>
                          <p className="text-xs text-gray-600">
                            Your email will be used for order updates and payment receipts.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {userDetails.isLoggedIn && userDetails.email && openStep !== 1 && (
              <div className="bg-gray-100 border-l-4 border-l-maroon px-5 py-4 flex justify-between items-center">
                <h2 className="font-semibold uppercase">1. User Email</h2>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">{userDetails.email}</span>
                  <button
                    onClick={() => openRequestedStep(1)}
                    className="text-sm text-maroon hover:text-[#660000] font-medium underline"
                  >
                    Edit
                  </button>
                </div>
              </div>
            )}

            <div className=" overflow-hidden">
              <div
                className="bg-gray-100 px-5 py-4 cursor-pointer border-l-4"
                style={{ borderColor: openStep === 2 ? MAROON : "transparent" }}
                onClick={() => openRequestedStep(2)}
              >
                <h2 className="font-semibold uppercase">2. Shipping Address</h2>

                {defaultAddress && (
                  <div className="text-sm mt-1">
                    <span className="text-green-700 font-medium">
                      {defaultAddress.firstName} {defaultAddress.lastName}
                    </span>
                    <span className="text-gray-600">, {defaultAddress.city}</span>
                    <span className="text-gray-500 text-xs ml-2">— click to edit</span>
                  </div>
                )}

                {!defaultAddress && userDetails.isLoggedIn && (
                  <p className="text-xs text-gray-500 mt-1">No saved address</p>
                )}
              </div>

              {openStep === 2 && (
                <div className="p-6">
                  {userDetails.isLoggedIn && defaultAddress && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-sm">
                      <p className="text-green-700 font-medium">Default address auto-selected</p>
                      <div className="text-sm text-gray-700 mt-2">
                        <p>
                          {defaultAddress.firstName} {defaultAddress.lastName}
                        </p>
                        <p>{defaultAddress.address}</p>
                        <p>
                          {defaultAddress.city}, {defaultAddress.stateProvince}{" "}
                          {defaultAddress.zipPostalCode}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-4">
                      <input
                        name="firstName"
                        placeholder="First Name"
                        value={shippingForm.firstName}
                        onChange={handleShippingChange}
                        className="border px-4 py-3 rounded-sm"
                      />
                      <input
                        name="lastName"
                        placeholder="Last Name"
                        value={shippingForm.lastName}
                        onChange={handleShippingChange}
                        className="border px-4 py-3 rounded-sm"
                      />
                    </div>
                    <input
                      name="streetAddress"
                      placeholder="Street Address"
                      value={shippingForm.streetAddress}
                      onChange={handleShippingChange}
                      className="w-full border px-4 py-3 rounded-sm"
                    />

                    <div className="grid md:grid-cols-3 gap-4">
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
                        className="border px-4 py-3 rounded-sm"
                      >
                        <option value="">Country</option>
                        {Country.getAllCountries().map((c) => (
                          <option key={c.isoCode} value={c.isoCode}>
                            {c.name}
                          </option>
                        ))}
                      </select>

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
                        className="border px-4 py-3 rounded-sm"
                      >
                        <option value="">State</option>
                        {selectedCountryCode &&
                          State.getStatesOfCountry(selectedCountryCode).map((s) => (
                            <option key={s.isoCode} value={s.isoCode}>
                              {s.name}
                            </option>
                          ))}
                      </select>

                      <select
                        value={shippingForm.city}
                        onChange={(e) =>
                          setShippingForm((prev) => ({ ...prev, city: e.target.value }))
                        }
                        disabled={!selectedStateCode}
                        className="border px-4 py-3 rounded-sm"
                      >
                        <option value="">City</option>
                        {selectedStateCode &&
                          City.getCitiesOfState(selectedCountryCode, selectedStateCode).map((c) => (
                            <option key={c.name} value={c.name}>
                              {c.name}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <input
                        name="postalCode"
                        placeholder="Postal Code"
                        maxLength={6}
                        value={shippingForm.postalCode}
                        onChange={handleShippingChange}
                        className="border px-4 py-3 rounded-sm"
                      />
                      <input
                        name="phone"
                        placeholder="Phone Number"
                        maxLength={10}
                        value={shippingForm.phone}
                        onChange={handleShippingChange}
                        className="border px-4 py-3 rounded-sm"
                      />
                    </div>

                    <button
                      onClick={handleProceedToPayment}
                      className="bg-primary text-gray-800 w-full bg-maroon text-white py-4 uppercase font-medium hover:bg-[#660000]"
                    >
                      {userDetails.role === "B2B" && defaultAddress
                        ? "Confirm Address & Proceed"
                        : "Proceed to Payment"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="border border-gray-200 rounded-sm">
              <div
                className="border-l-4 bg-gray-100 px-4 py-3 flex justify-between items-center cursor-pointer"
                style={{ borderColor: openStep === 3 ? MAROON : "transparent" }}
                onClick={() => openRequestedStep(3)}
              >
                <h2 className="font-semibold text-[15px] uppercase">3. Payment Method</h2>
              </div>
              {openStep === 3 && (
                <div className="p-6 space-y-4">
                  {/* Shipping Courier Selection UI */}
                  {step3Unlocked && loadingRates && (
                    <div className="text-center py-4 bg-gray-50 rounded mb-4">
                      <p className="text-gray-600 animate-pulse">Computing best shipping rates...</p>
                    </div>
                  )}

                  {step3Unlocked && shippingRates.length > 0 && (
                    <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-sm">
                      <h3 className="font-semibold mb-3 text-gray-800">Select Shipping Partner</h3>
                      <div className="space-y-3 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300">
                        {shippingRates.map((courier) => (
                          <div
                            key={courier.courier_company_id}
                            onClick={() => setSelectedCourier(courier)}
                            className={`flex justify-between items-center p-3 border rounded-sm cursor-pointer transition-all ${
                              selectedCourier?.courier_company_id === courier.courier_company_id
                                ? 'border-[#800000] bg-white shadow-sm ring-1 ring-[#800000]'
                                : 'border-gray-300 hover:border-gray-400 bg-white'
                            }`}
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-800">{courier.courier_name}</span>
                                {selectedCourier?.courier_company_id === courier.courier_company_id && (
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Selected</span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5">
                                Est. Delivery: {courier.etd || '3-5 days'}
                              </p>
                              {courier.rating && (
                                <p className="text-[10px] text-yellow-600 mt-0.5">
                                  ★ {courier.rating}/5 Rating
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-[#800000]">₹{courier.freight_charge}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2 italic">
                        * Shipping rates are calculated based on weight and location.
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    {["cod", "card", "netbank", "upi"].map((method) => (
                      <button
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        className={`border border-gray-300 py-4 rounded-sm uppercase ${paymentMethod === method ? "bg-[#800000] text-white" : ""
                          }`}
                      >
                        {method === "cod"
                          ? "Cash on Delivery"
                          : method === "card"
                            ? "Credit/Debit Card"
                            : method === "netbank"
                              ? "Net Banking"
                              : "UPI"}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handlePayNow}
                    disabled={isProcessingPayment}
                    className="bg-[#800000] text-white px-6 py-3 rounded-sm hover:bg-[#660000] disabled:bg-gray-400"
                  >
                    {isProcessingPayment ? "Processing..." : "Pay Now"}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="border border-gray-300 mt-4 rounded-sm p-6">
              <h3 className="font-bold uppercase mb-4">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span> <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount</span> <span>-₹{discount.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span> <span>₹{shippingFee}</span>
                </div>
                <div className="border-t pt-3 font-bold text-lg flex justify-between">
                  <span>Total</span>
                  <span>₹{totalPayable.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="border border-gray-300 rounded-sm p-6">
              <h3 className="font-bold uppercase mb-4">Items</h3>
              {transformedCartItems.length === 0 ? (
                <p className="text-gray-600 text-center py-4">Your cart is empty.</p>
              ) : (
                transformedCartItems.map((item, i) => (
                  <div key={i} className="flex gap-4 mb-4 pb-4 border-b last:border-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-24 object-cover rounded-sm"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-gray-600">
                        {item.color} | Size: {item.size}
                      </p>
                      <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                      {item.isB2BVariant && <p className="text-xs text-blue-600">B2B Variant</p>}
                    </div>
                    <p className="font-medium">
                      ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
