// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { subscribeToCart, clearCart } from "../../services/CartService";
// import b2clogo from "../@/assets/Navbar/b2cLogo.png";

// export default function CheckoutPage() {
//   const navigate = useNavigate();

//   // cart
//   const [cartItems, setCartItems] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);

//   // accordion state
//   const [openStep, setOpenStep] = useState(1); // 1 open by default
//   const [step2Unlocked, setStep2Unlocked] = useState(false);
//   const [step3Unlocked, setStep3Unlocked] = useState(false);

//   // Step1 (user details)
//   const [email, setEmail] = useState("");

//   // Step2 (shipping) - minimal fields for unlocking; you'll extend later
//   const [shippingForm, setShippingForm] = useState({
//     firstName: "",
//     lastName: "",
//     streetAddress: "",
//     city: "",
//     state: "",
//     postalCode: "",
//     country: "",
//     phone: "",
//   });

//   // Step3 (payment) - placeholder selection
//   const [paymentMethod, setPaymentMethod] = useState("credit");

//   // coupon (right panel)
//   const [couponCode, setCouponCode] = useState("");

//   // subscribe to cart
//   useEffect(() => {
//     let unsubscribe = null;
//     const setup = async () => {
//       try {
//         unsubscribe = await subscribeToCart((items) => {
//           setCartItems(items || []);
//           setIsLoading(false);
//         });
//       } catch (err) {
//         console.error("subscribeToCart error:", err);
//         setIsLoading(false);
//       }
//     };
//     setup();
//     return () => {
//       if (unsubscribe) unsubscribe();
//     };
//   }, []);

//   // totals
//   const subtotal = cartItems.reduce(
//     (s, item) => s + (item.subtotal || item.price * (item.quantity || 1)),
//     0
//   );
//   const discount = subtotal * 0.12;
//   const shippingFee = cartItems.some((i) => !i.freeShipping) ? 50 : 0;
//   const totalPayable = Math.max(0, subtotal - discount + shippingFee);

//   // --- Step logic helpers ---

//   // Basic email validation
//   const isValidEmail = (em) => {
//     return /^\S+@\S+\.\S+$/.test(em);
//   };

//   // When user clicks "Checkout as Guest" or after entering email -> unlock Step2
//   const handleCheckoutAsGuest = () => {
//     if (!isValidEmail(email)) {
//       alert("Please enter a valid email address.");
//       return;
//     }
//     setStep2Unlocked(true);
//     setOpenStep(2);
//   };

//   // Step2: validate minimal shipping fields
//   const isShippingValid = () => {
//     const { firstName, lastName, streetAddress, city, state, postalCode, country, phone } =
//       shippingForm;
//     return (
//       firstName.trim() &&
//       lastName.trim() &&
//       streetAddress.trim() &&
//       city.trim() &&
//       state.trim() &&
//       postalCode.trim() &&
//       country.trim() &&
//       phone.trim()
//     );
//   };

//   const handleProceedToPayment = () => {
//     if (!isShippingValid()) {
//       alert("Please fill all required shipping fields before continuing.");
//       return;
//     }
//     setStep3Unlocked(true);
//     setOpenStep(3);
//   };

//   // Placeholder pay now (you will integrate your Razorpay logic)
//   const handlePayNow = () => {
//     if (!step3Unlocked) {
//       alert("Please complete previous steps first.");
//       return;
//     }
//     alert("Pay Now clicked — integrate payment logic here.");
//   };

//   // update shipping form fields
//   const handleShippingChange = (e) => {
//     const { name, value } = e.target;
//     setShippingForm((p) => ({ ...p, [name]: value }));
//   };

//   // toggle accordion (only open if unlocked or opening step1)
//   const openRequestedStep = (n) => {
//     if (n === 1) {
//       setOpenStep(1);
//       return;
//     }
//     if (n === 2 && step2Unlocked) {
//       setOpenStep(2);
//       return;
//     }
//     if (n === 3 && step3Unlocked) {
//       setOpenStep(3);
//       return;
//     }
//     // if step not unlocked, show a subtle message
//     if (n === 2) alert("Please provide your email in Step 1 to continue.");
//     if (n === 3) alert("Please complete Shipping in Step 2 to continue.");
//   };

//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center font-[Outfit]">
//         Loading checkout...
//       </div>
//     );
//   }

//   // Tailwind utility: maroon color - we will inline the hex for guaranteed match
//   const MAROON = "#800000";

//   return (
//     <div className="min-h-screen bg-white font-[Outfit]">
//       <div className="max-w-[1200px] mx-auto px-6 py-8">
//         {/* Header */}
//         <div className="flex items-center gap-4 mb-8">
//           <img
//             src={b2clogo}
//             alt="logo"
//             className="h-6 object-contain cursor-pointer"
//             onClick={() => navigate("/")}
//           />
//           <h1 className="text-[22px] font-semibold uppercase tracking-wide border-l-4 pl-3" style={{ borderColor: MAROON }}>
//             Check Out
//           </h1>
//         </div>

//         {/* Main grid: left (steps) and right (summary) */}
//         <div className="grid grid-cols-1 lg:grid-cols-[1fr_395px] gap-6">
//           {/* LEFT: steps (uses gap 24px) */}
//           <div className="space-y-6">
//             {/* Step container base style - we apply inner content size: width:685px height:401px */}
//             {/* 1. USER DETAILS */}
//             <div className="border border-gray-200 rounded-sm">
//               {/* header */}
//               <div
//                 className="bg-[#f3efee] px-4 py-3 flex items-center justify-between cursor-pointer"
//                 onClick={() => openRequestedStep(1)}
//                 style={{ gap: 24 }}
//               >
//                 <div className="flex items-center gap-3">
//                   <div style={{ width: 6, height: 30, background: "transparent" }} />
//                   <h2 className="text-[15px] font-semibold uppercase">1. User Details</h2>
//                 </div>
//                 {/* small email preview when step closed */}
//                 {openStep !== 1 && email && (
//                   <div className="text-sm text-gray-600">{email}</div>
//                 )}
//               </div>

//               {/* content */}
//               {openStep === 1 && (
//                 <div
//                   className="p-6"
//                   style={{
//                     width: 685, // per your request
//                     height: 401,
//                     boxSizing: "border-box",
//                   }}
//                 >
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     {/* left column */}
//                     <div>
//                       <p className="text-[14px] text-gray-700 mb-3">
//                         Tell us your Email ID for sending you your order details
//                       </p>
//                       <input
//                         type="email"
//                         placeholder="Email ID"
//                         value={email}
//                         onChange={(e) => setEmail(e.target.value)}
//                         className="w-full border border-gray-300 rounded-sm px-3 py-2 mb-4 focus:outline-none focus:ring-1"
//                         aria-label="email"
//                       />
//                       <button
//                         onClick={handleCheckoutAsGuest}
//                         className="w-full bg-[rgb(128,0,0)] text-white py-3 uppercase text-[14px] rounded-sm hover:bg-[rgb(110,0,0)] transition"
//                       >
//                         Checkout as Guest
//                       </button>
//                     </div>

//                     {/* right column (signup prompt) */}
//                     <div>
//                       <p className="text-[14px] text-gray-700 mb-3 text-right">
//                         Don't have an account? <br />
//                         Create an account for faster transactions.
//                       </p>
//                       <div className="text-right">
//                         <button
//                           onClick={() => alert("Sign up logic — integrate your auth flow")}
//                           className="text-[14px] text-[rgb(128,0,0)] hover:underline font-medium"
//                         >
//                           Sign up!
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* 2. SHIPPING & BILLING INFO */}
//             <div className="border border-gray-200 rounded-sm">
//               <div
//                 className="bg-[#f3efee] px-4 py-3 flex items-center justify-between cursor-pointer"
//                 onClick={() => openRequestedStep(2)}
//                 style={{ gap: 24 }}
//               >
//                 <div className="flex items-center gap-3">
//                   {/* maroon left bar when step active; replicate DVYB: small vertical bar */}
//                   <div style={{ width: 6, height: 30, background: openStep === 2 ? MAROON : "transparent" }} />
//                   <h2 className="text-[15px] font-semibold uppercase">2. Shipping & Billing Info</h2>
//                 </div>
//                 {/* optionally show 'Change' */}
//                 {openStep !== 2 && step2Unlocked && (
//                   <div className="text-sm text-gray-600">Change</div>
//                 )}
//               </div>

//               {/* content (placeholder form) */}
//               {openStep === 2 && (
//                 <div
//                   className="p-6"
//                   style={{
//                     width: 685,
//                     height: 401,
//                     boxSizing: "border-box",
//                   }}
//                 >
//                   <div className="space-y-4">
//                     <p className="text-[14px] text-gray-700">
//                       Select / Enter Your Shipping Address
//                     </p>

//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       <input
//                         name="firstName"
//                         value={shippingForm.firstName}
//                         onChange={handleShippingChange}
//                         placeholder="First Name"
//                         className="w-full border border-gray-300 px-3 py-2 rounded-sm"
//                       />
//                       <input
//                         name="lastName"
//                         value={shippingForm.lastName}
//                         onChange={handleShippingChange}
//                         placeholder="Last Name"
//                         className="w-full border border-gray-300 px-3 py-2 rounded-sm"
//                       />
//                     </div>

//                     <input
//                       name="streetAddress"
//                       value={shippingForm.streetAddress}
//                       onChange={handleShippingChange}
//                       placeholder="Street Address"
//                       className="w-full border border-gray-300 px-3 py-2 rounded-sm"
//                     />

//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                       <input
//                         name="city"
//                         value={shippingForm.city}
//                         onChange={handleShippingChange}
//                         placeholder="City"
//                         className="w-full border border-gray-300 px-3 py-2 rounded-sm"
//                       />
//                       <input
//                         name="state"
//                         value={shippingForm.state}
//                         onChange={handleShippingChange}
//                         placeholder="State"
//                         className="w-full border border-gray-300 px-3 py-2 rounded-sm"
//                       />
//                       <input
//                         name="postalCode"
//                         value={shippingForm.postalCode}
//                         onChange={handleShippingChange}
//                         placeholder="Postal Code"
//                         className="w-full border border-gray-300 px-3 py-2 rounded-sm"
//                       />
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
//                       <input
//                         name="country"
//                         value={shippingForm.country}
//                         onChange={handleShippingChange}
//                         placeholder="Country"
//                         className="w-full border border-gray-300 px-3 py-2 rounded-sm"
//                       />
//                       <input
//                         name="phone"
//                         value={shippingForm.phone}
//                         onChange={handleShippingChange}
//                         placeholder="Phone"
//                         className="w-full border border-gray-300 px-3 py-2 rounded-sm"
//                       />
//                     </div>

//                     <div className="flex items-center gap-4 mt-2">
//                       <label className="flex items-center gap-2 text-[13px]">
//                         <input type="checkbox" className="w-4 h-4 accent-[rgb(128,0,0)]" />
//                         Billing Address is same as Shipping Address
//                       </label>
//                     </div>

//                     <div className="flex items-center gap-4 mt-4">
//                       <button
//                         onClick={handleProceedToPayment}
//                         className="bg-[rgb(128,0,0)] text-white px-6 py-3 uppercase rounded-sm hover:bg-[rgb(110,0,0)]"
//                       >
//                         Proceed to Payment
//                       </button>
//                       <button
//                         onClick={() => alert("Add new address flow - integrate modal / page")}
//                         className="border border-gray-400 px-6 py-3 rounded-sm"
//                       >
//                         Add New Address
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* 3. PAYMENT METHOD */}
//             <div className="border border-gray-200 rounded-sm">
//               <div
//                 className="bg-[#f3efee] px-4 py-3 flex items-center justify-between cursor-pointer"
//                 onClick={() => openRequestedStep(3)}
//                 style={{ gap: 24 }}
//               >
//                 <div className="flex items-center gap-3">
//                   <div style={{ width: 6, height: 30, background: openStep === 3 ? MAROON : "transparent" }} />
//                   <h2 className="text-[15px] font-semibold uppercase">3. Payment Method</h2>
//                 </div>
//                 {openStep !== 3 && step3Unlocked && <div className="text-sm text-gray-600">Change</div>}
//               </div>

//               {/* content */}
//               {openStep === 3 && (
//                 <div
//                   className="p-6"
//                   style={{
//                     width: 685,
//                     height: 401,
//                     boxSizing: "border-box",
//                   }}
//                 >
//                   <div className="space-y-4">
//                     <p className="text-[14px] text-gray-700">Choose a payment method</p>

//                     <div className="grid grid-cols-2 gap-4">
//                       <button
//                         onClick={() => setPaymentMethod("cod")}
//                         className={`border border-gray-300 py-4 rounded-sm uppercase ${paymentMethod === "cod" ? "bg-[rgb(128,0,0)] text-white" : ""}`}
//                       >
//                         Cash on Delivery
//                       </button>
//                       <button
//                         onClick={() => setPaymentMethod("netbank")}
//                         className={`border border-gray-300 py-4 rounded-sm uppercase ${paymentMethod === "netbank" ? "bg-[rgb(128,0,0)] text-white" : ""}`}
//                       >
//                         Net Banking
//                       </button>
//                       <button
//                         onClick={() => setPaymentMethod("card")}
//                         className={`border border-gray-300 py-4 rounded-sm uppercase ${paymentMethod === "card" ? "bg-[rgb(128,0,0)] text-white" : ""}`}
//                       >
//                         Credit / Debit Card
//                       </button>
//                       <button
//                         onClick={() => setPaymentMethod("upi")}
//                         className={`border border-gray-300 py-4 rounded-sm uppercase ${paymentMethod === "upi" ? "bg-[rgb(128,0,0)] text-white" : ""}`}
//                       >
//                         UPI
//                       </button>
//                     </div>

//                     <div className="flex items-center gap-3 mt-4">
//                       <label className="flex items-center gap-2 text-sm">
//                         <input type="checkbox" className="w-4 h-4 accent-[rgb(128,0,0)]" />
//                         I understand and agree to DVYB T&C
//                       </label>
//                       <div className="flex-1 text-right">
//                         <button
//                           onClick={handlePayNow}
//                           className="bg-[rgb(128,0,0)] text-white px-6 py-3 rounded-sm hover:bg-[rgb(110,0,0)]"
//                         >
//                           Pay Now
//                         </button>
//                       </div>
//                     </div>

//                     <div className="mt-4 text-sm text-gray-600">
//                       <i className="mr-2">🔒</i> Secure Checkout
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* RIGHT: Cart summary & Product summary */}
//           <div>
//             <div
//               className="border border-gray-200 rounded-sm p-6"
//               style={{ width: 395, height: 1188, boxSizing: "border-box", overflow: "hidden" }}
//             >
//               <h3 className="text-[16px] font-semibold mb-4">Cart Summary</h3>

//               <div className="border border-gray-200 p-4 mb-4">
//                 <div className="flex justify-between text-sm mb-2">
//                   <span>Cart Total</span>
//                   <span>₹{subtotal.toLocaleString()}</span>
//                 </div>
//                 <div className="flex justify-between text-sm mb-2">
//                   <span>Total Discount</span>
//                   <span>(-) ₹{discount.toLocaleString()}</span>
//                 </div>
//                 <div className="flex justify-between text-sm mb-1">
//                   <span>Shipping</span>
//                   <span>₹{shippingFee}</span>
//                 </div>
//                 <p className="text-xs text-gray-500 mt-1">Shipping Charges To Be Calculated On Checkout</p>
//               </div>

//               <div className="mb-4">
//                 <label className="flex items-center gap-2 text-sm">
//                   <input type="checkbox" className="w-4 h-4 accent-[rgb(128,0,0)]" />
//                   This is a gift item
//                 </label>
//                 <div className="text-[13px] text-[rgb(128,0,0)] float-right cursor-pointer">(Know More)</div>
//               </div>

//               <div className="mb-4">
//                 <label className="block uppercase text-[13px] font-medium mb-2">Coupon Code</label>
//                 <div className="flex">
//                   <input
//                     value={couponCode}
//                     onChange={(e) => setCouponCode(e.target.value)}
//                     placeholder="Enter Coupon Code"
//                     className="flex-1 border border-gray-300 px-3 py-2 rounded-sm"
//                   />
//                   <button className="bg-[rgb(128,0,0)] text-white px-4 ml-2 rounded-sm">Apply</button>
//                 </div>
//               </div>

//               <div className="border-t border-gray-200 pt-4 mb-6">
//                 <div className="flex justify-between items-center">
//                   <span className="uppercase font-medium text-[14px]">Total Payable</span>
//                   <span className="text-[20px] font-semibold">₹{totalPayable.toLocaleString()}</span>
//                 </div>
//               </div>

//               <div className="space-y-3 mb-6">
//                 <button className="w-full bg-[rgb(128,0,0)] text-white py-3 rounded-sm uppercase">Proceed to Checkout</button>
//                 <button onClick={() => navigate("/")} className="w-full border border-[rgb(128,0,0)] text-[rgb(128,0,0)] py-3 rounded-sm uppercase">Continue Shopping</button>
//               </div>

//               <div style={{ height: 520, overflowY: "auto", paddingRight: 6 }}>
//                 <h4 className="text-[15px] font-semibold mb-3">Product Summary</h4>
//                 <div className="space-y-4">
//                   {cartItems.length === 0 ? (
//                     <div className="text-gray-600 text-sm">No items in cart.</div>
//                   ) : (
//                     cartItems.map((it, idx) => (
//                       <div key={idx} className="border border-gray-100 p-3 flex gap-3 items-start rounded-sm">
//                         <img
//                           src={it.imageUrls?.[0] || "https://via.placeholder.com/80"}
//                           alt={it.name}
//                           className="w-20 h-24 object-cover rounded-sm"
//                         />
//                         <div className="flex-1">
//                           <div className="font-medium text-[14px]">{it.name}</div>
//                           <div className="text-xs text-gray-500">{it.description || it.color || ""}</div>
//                           <div className="text-sm font-semibold mt-2">₹{(it.price || 0).toLocaleString()}</div>
//                           <div className="text-[11px] text-gray-400 mt-1">ESTIMATED SHIPPING DATE : 4TH OF NOVEMBER</div>
//                         </div>
//                       </div>
//                     ))
//                   )}
//                 </div>
//               </div>

//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
