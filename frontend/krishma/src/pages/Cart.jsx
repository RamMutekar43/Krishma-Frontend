import React, { useEffect, useState } from "react";

const Cart = ({ cart, removeFromCart, addToCart }) => {
  const [recommendations, setRecommendations] = useState([]);
  const userId = localStorage.getItem("userId") || "guest";

  const total = cart.reduce((acc, item) => acc + item.price, 0);

  // 🔹 Handle remove & log purchase event
  const handleRemove = (idx) => {
    const product = cart[idx];

    // Track purchase event
    fetch("http://localhost:5000/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: userId,
        productId: product._id,
        eventType: "purchase",
        value: product.quantity || 1, // default to 1 if quantity missing
      }),
    });

    removeFromCart(idx);
  };

  // 🔹 Fetch recommendations
  useEffect(() => {
    fetch(`http://localhost:5000/api/recommend/${userId}`)
      .then((res) => res.json())
      .then((data) => setRecommendations(data))
      .catch((err) => console.error("Error fetching recommendations:", err));
  }, [userId]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>

      {cart.length === 0 ? (
        <p className="text-gray-600">Cart is empty</p>
      ) : (
        <div>
          {cart.map((item, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center border-b py-2"
            >
              <span>
                {item.name} - ₹{item.price}
              </span>
              <button
                onClick={() => handleRemove(idx)}
                className="bg-red-600 text-white px-2 py-1 rounded"
              >
                Remove
              </button>
            </div>
          ))}

          <h3 className="mt-4 text-lg font-semibold">Total: ₹{total}</h3>
        </div>
      )}

      {/* 🔹 Recommendations Section */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-3">You may also like</h2>
        {recommendations.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {recommendations.map((product) => (
              <div
                key={product._id}
                className="p-4 border rounded shadow hover:shadow-lg"
              >
                {product.image && (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-32 object-cover mb-2"
                  />
                )}
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-gray-700">₹{product.price}</p>

                {/* 🔹 Add to Cart button for recommendations */}
                <button
                  onClick={() => addToCart(product)}
                  className="mt-2 bg-green-600 text-white px-3 py-1 rounded"
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No recommendations yet.</p>
        )}
      </div>
    </div>
  );
};

export default Cart;
