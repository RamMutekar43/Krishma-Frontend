import React, { useEffect } from "react";

const ProductCard = ({ product, addToCart }) => {
  const userId = localStorage.getItem("userId") || "guest";

  // 🔹 Reusable logEvent function
  const logEvent = async (userId, productId, eventType) => {
    await fetch("http://localhost:5000/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        productId,
        eventType,
        value: 1,
      }),
    });
  };

  // 🔹 Track product view automatically when rendered
  useEffect(() => {
    logEvent(userId, product._id, "view");
  }, [product, userId]);

  // 🔹 Add to cart & track event
  const handleAddToCart = () => {
    addToCart(product);
    logEvent(userId, product._id, "add_to_cart");
  };

  return (
    <div className="p-4 border rounded shadow hover:shadow-lg cursor-pointer">
      {product.image && (
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-40 object-cover mb-2"
        />
      )}
      <h3 className="font-semibold">{product.name}</h3>
      <p className="text-gray-700">{product.price} ₹</p>

      <button
        onClick={(e) => {
          e.stopPropagation(); // prevent accidental "view"
          handleAddToCart();
        }}
        className="mt-2 bg-blue-600 text-white px-3 py-1 rounded"
      >
        Add to Cart
      </button>
    </div>
  );
};

export default ProductCard;
