import { useEffect, useState } from "react";
import { getProducts } from "../api/api.jsx";
import ProductCard from "../components/ProductCard.jsx";
import Recommendations from "../components/recommendations.jsx"; // ✅ use relative path

const Home = ({ addToCart }) => {
  const [products, setProducts] = useState([]);
  const userId = localStorage.getItem("userId") || "guest"; // get user id if logged in

  useEffect(() => {
    getProducts().then(data => setProducts(data));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Welcome to Krishma Dairy</h1>

      {/* ✅ Recommendations Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Recommended for You</h2>
        <Recommendations userId={userId} addToCart={addToCart} />
      </div>

      {/* ✅ All Products Section */}
      <div>
        <h2 className="text-xl font-semibold mb-2">All Products</h2>
        <div className="product-grid grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map(p => (
            <ProductCard key={p._id} product={p} addToCart={addToCart} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
