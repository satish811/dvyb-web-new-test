import React, { useState } from "react";
import { Filter } from "lucide-react";

const B2bMyOrdersPage = () => {
  const [activeTab, setActiveTab] = useState("Active");

  const orders = [
    {
      id: "#123456789",
      orderDate: "2 June 2023, 2:40 PM",
      estimatedDelivery: "8 June 2023",
      status: "In progress",
      paymentMethod: "Cash on delivery",
      product: {
        name: "Black Printed T-shirt",
        color: "Print",
        qty: 1,
        price: "$23.00",
        image: "/api/placeholder/60/60",
      },
    },
    {
      id: "#123456683",
      orderDate: "2 June 2023, 2:40 PM",
      estimatedDelivery: "8 June 2023",
      status: "In progress",
      paymentMethod: "Cash on delivery",
      product: {
        name: "Black Printed T-shirt",
        color: "Print",
        qty: 1,
        price: "$23.00",
        image: "/api/placeholder/60/60",
      },
    },
    {
      id: "#123451364",
      orderDate: "2 June 2023, 2:40 PM",
      estimatedDelivery: "8 June 2023",
      status: "In progress",
      paymentMethod: "Cash on delivery",
      product: {
        name: "Black Printed T-shirt",
        color: "Print",
        qty: 1,
        price: "$23.00",
        image: "/api/placeholder/60/60",
      },
    },
  ];

  const handleViewDetail = (orderId) => {
    alert(`Viewing details for order: ${orderId}`);
    // Add your view detail logic here
  };

  const handleFilter = () => {
    alert("Filter functionality to be implemented");
    // Add your filter logic here
  };

  return (
    <div className="flex-1 bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">My Orders</h1>
            <p className="text-gray-600">Total Items: 64</p>
          </div>
          <button
            onClick={handleFilter}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter size={16} />
            Filter
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex border-b">
            {["Active", "Delivered", "Cancelled", "Returned"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-6">
            {orders.length > 0 ? (
              orders.map((order, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-6 mb-4 last:mb-0 hover:shadow-sm transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-orange-600 mb-2">
                        Order no: {order.id}
                      </h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Order Date: {order.orderDate}</p>
                        <p>Estimated Delivery Date: {order.estimatedDelivery}</p>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      <p>
                        Order Status:{" "}
                        <span className="font-medium text-gray-900">{order.status}</span>
                      </p>
                      <p>
                        Payment Method:{" "}
                        <span className="font-medium text-gray-900">{order.paymentMethod}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                          <div className="w-6 h-6 bg-white rounded-full"></div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{order.product.name}</h4>
                        <p className="text-sm text-gray-600">Colour: {order.product.color}</p>
                        <p className="text-sm text-gray-600">Qty: {order.product.qty}</p>
                        <p className="font-semibold text-gray-900">Total: {order.product.price}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewDetail(order.id)}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      View Detail
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No orders found for the selected tab.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default B2bMyOrdersPage;
